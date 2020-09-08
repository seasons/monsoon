-- Inspired by: https://wiki.postgresql.org/wiki/Audit_trigger_91plus  

-- Need this datatype to store update logs as key/value data
CREATE EXTENSION IF NOT EXISTS hstore;

DROP SCHEMA audit CASCADE;
CREATE SCHEMA audit;
REVOKE ALL ON SCHEMA audit FROM public;

CREATE TABLE audit.logged_actions (
    event_id bigserial primary key,
    table_name text not null,
    active_admin_user text,
    triggered_at TIMESTAMP WITH TIME ZONE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('I','D','U', 'T')),
    row_data hstore,
    changed_fields hstore,
    statement_only boolean not null
);

REVOKE ALL ON audit.logged_actions FROM public;

CREATE INDEX logged_actions_action_idx ON audit.logged_actions(action);

CREATE OR REPLACE FUNCTION audit.if_modified_func() RETURNS TRIGGER AS $body$
DECLARE
    audit_row audit.logged_actions;
    excluded_cols text[] = ARRAY[]::text[];
    active_admin_user text;
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
    END IF;

    active_admin_user = (SELECT admin FROM monsoon$dev."ActiveAdminUser" LIMIT 1);
    -- Probably want to assert something here: https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html 
    audit_row = ROW(
        nextval('audit.logged_actions_event_id_seq'), -- event_id
        TG_TABLE_NAME::text,                          -- table_name
        active_admin_user,                            -- id of currently active user
        current_timestamp,                            -- triggered_at
        substring(TG_OP,1,1),                         -- action
        NULL, NULL,                                   -- row_data, changed_fields
        'f'                                           -- statement_only
        );


    IF TG_ARGV[0] IS NOT NULL THEN
        excluded_cols = TG_ARGV[0]::text[];
    END IF;
    
    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
        audit_row.changed_fields =  (hstore(NEW.*) - audit_row.row_data) - excluded_cols;
        IF audit_row.changed_fields = hstore('') THEN
            -- All changed fields are ignored. Skip this update.
            RETURN NULL;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(NEW.*) - excluded_cols;
    ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
        audit_row.statement_only = 't';
    ELSE
        RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;
    INSERT INTO audit.logged_actions VALUES (audit_row.*);
    RETURN NULL;
END;
$body$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;


COMMENT ON FUNCTION audit.if_modified_func() IS $body$
Track changes to a table at the statement and/or row level.

Optional parameters to trigger in CREATE TRIGGER call:

param 0: text[], columns to ignore in updates. Default [].

         Updates to ignored cols are omitted from changed_fields.

         Updates with only ignored cols changed are not inserted
         into the audit log.

         Almost all the processing work is still done for updates
         that ignored. If you need to save the load, you need to use
         WHEN clause on the trigger instead.

         No warning or error is issued if ignored_cols contains columns
         that do not exist in the target table. This lets you specify
         a standard set of ignored columns.

There is no parameter to disable logging of values. Add this trigger as
a 'FOR EACH STATEMENT' rather than 'FOR EACH ROW' trigger if you do not
want to log row values.

Note that the user name logged is the login role for the session. The audit trigger
cannot obtain the active role because it is reset by the SECURITY DEFINER invocation
of the audit trigger its self.
$body$;



CREATE OR REPLACE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, ignored_cols text[]) RETURNS void AS $body$
DECLARE
  stm_targets text = 'INSERT OR UPDATE OR DELETE OR TRUNCATE';
  _q_txt text;
  _ignored_cols_snip text = '';
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_row ON ' || target_table;
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_stm ON ' || target_table;

    IF audit_rows THEN
        IF array_length(ignored_cols,1) > 0 THEN
            _ignored_cols_snip = ', ' || quote_literal(ignored_cols);
        END IF;
        _q_txt = 'CREATE TRIGGER audit_trigger_row AFTER INSERT OR UPDATE OR DELETE ON ' || 
                 target_table || 
                 ' FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func(' || _ignored_cols_snip || ');';
        RAISE NOTICE '%',_q_txt;
        EXECUTE _q_txt;
        stm_targets = 'TRUNCATE';
    ELSE
    END IF;

    _q_txt = 'CREATE TRIGGER audit_trigger_stm AFTER ' || stm_targets || ' ON ' ||
             target_table ||
             ' FOR EACH STATEMENT EXECUTE PROCEDURE audit.if_modified_func();';
    RAISE NOTICE '%',_q_txt;
    EXECUTE _q_txt;

END;
$body$
language 'plpgsql';

COMMENT ON FUNCTION audit.audit_table(regclass, boolean, text[]) IS $body$
Add auditing support to a table.

Arguments:
   target_table:     Table name, schema qualified if not on search_path
   audit_rows:       Record each row change, or only audit at a statement level
   ignored_cols:     Columns to exclude from update diffs, ignore updates that change only ignored cols.
$body$;

-- Pg doesn't allow variadic calls with 0 params, so provide a wrapper
CREATE OR REPLACE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean) RETURNS void AS $body$
SELECT audit.audit_table($1, $2, ARRAY[]::text[]);
$body$ LANGUAGE SQL;

-- And provide a convenience call wrapper for the simplest case
-- of row-level logging with no excluded cols and query logging enabled.
--
CREATE OR REPLACE FUNCTION audit.audit_table(target_table regclass) RETURNS void AS $body$
SELECT audit.audit_table($1, BOOLEAN 't');
$body$ LANGUAGE 'sql';

COMMENT ON FUNCTION audit.audit_table(regclass) IS $body$
Add auditing support to the given table. Row-level changes will be logged with full client query text. No cols are ignored.
$body$;

CREATE OR REPLACE VIEW audit.tableslist AS 
 SELECT DISTINCT triggers.trigger_schema AS schema,
    triggers.event_object_table AS auditedtable
   FROM information_schema.triggers
    WHERE triggers.trigger_name::text IN ('audit_trigger_row'::text, 'audit_trigger_stm'::text)  
ORDER BY schema, auditedtable;

COMMENT ON VIEW audit.tableslist IS $body$
View showing all tables with auditing set up. Ordered by schema, then table.
$body$;

--- Add logs to tables
SELECT audit.audit_table('monsoon$dev."Customer"');
SELECT audit.audit_table('monsoon$dev."User"');
SELECT audit.audit_table('monsoon$dev."Product"');
SELECT audit.audit_table('monsoon$dev."PhysicalProduct"');
SELECT audit.audit_table('monsoon$dev."ProductVariant"');
SELECT audit.audit_table('monsoon$dev."Brand"');
SELECT audit.audit_table('monsoon$dev."Category"');
-- add more 