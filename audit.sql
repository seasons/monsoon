-- Inspired by: https://wiki.postgresql.org/wiki/Audit_trigger_91plus  

-- Need this datatype to store update logs as key/value data
CREATE EXTENSION IF NOT EXISTS hstore;

CREATE OR REPLACE FUNCTION monsoon$dev.if_modified_func() RETURNS TRIGGER AS $body$
DECLARE
    audit_row monsoon$dev."AdminActionLog";
    row_data hstore;
    changed_fields hstore;
    excluded_cols text[] = ARRAY[]::text[];
    active_admin_user text;
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'monsoon$dev.if_modified_func() may only run as an AFTER trigger';
    END IF;

    active_admin_user = (SELECT admin FROM monsoon$dev."ActiveAdminUser" LIMIT 1);
    -- Probably want to assert something here: https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html 

    IF TG_ARGV[0] IS NOT NULL THEN
        excluded_cols = TG_ARGV[0]::text[];
    END IF;
    
    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        row_data = hstore(OLD.*) - excluded_cols;
        changed_fields =  (hstore(NEW.*) - row_data) - excluded_cols;
        IF changed_fields = hstore('') THEN
            -- All changed fields are ignored. Skip this update.
            RETURN NULL;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        row_data = hstore(OLD.*) - excluded_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        row_data = hstore(NEW.*) - excluded_cols;
    ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
        audit_row."statementOnly" = 't';
    ELSE
        RAISE EXCEPTION '[monsoon$dev.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;

    audit_row."actionId" = nextval('monsoon$dev."AdminActionLog_actionId_seq"');
    audit_row."tableName" = TG_TABLE_NAME::text;
    audit_row."triggeredAt" = current_timestamp;
    audit_row."action" = INITCAP(TG_OP);
    audit_row."activeAdminUser" = active_admin_user;
    audit_row."statementOnly" = 'f';
    -- prisma doesn't support hstore. So convert hstore to JSON
    audit_row."rowData" = hstore_to_json(row_data);
    audit_row."changedFields" = hstore_to_json(changed_fields);

    INSERT INTO monsoon$dev."AdminActionLog" VALUES (audit_row.*);
    RETURN NULL;
END;
$body$
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;


COMMENT ON FUNCTION monsoon$dev.if_modified_func() IS $body$
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



CREATE OR REPLACE FUNCTION monsoon$dev.audit_table(target_table regclass, audit_rows boolean, ignored_cols text[]) RETURNS void AS $body$
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
                 ' FOR EACH ROW EXECUTE PROCEDURE monsoon$dev.if_modified_func(' || _ignored_cols_snip || ');';
        RAISE NOTICE '%',_q_txt;
        EXECUTE _q_txt;
        stm_targets = 'TRUNCATE';
    ELSE
    END IF;

    _q_txt = 'CREATE TRIGGER audit_trigger_stm AFTER ' || stm_targets || ' ON ' ||
             target_table ||
             ' FOR EACH STATEMENT EXECUTE PROCEDURE monsoon$dev.if_modified_func();';
    RAISE NOTICE '%',_q_txt;
    EXECUTE _q_txt;

END;
$body$
language 'plpgsql';

COMMENT ON FUNCTION monsoon$dev.audit_table(regclass, boolean, text[]) IS $body$
Add auditing support to a table.

Arguments:
   target_table:     Table name, schema qualified if not on search_path
   audit_rows:       Record each row change, or only audit at a statement level
   ignored_cols:     Columns to exclude from update diffs, ignore updates that change only ignored cols.
$body$;

-- Pg doesn't allow variadic calls with 0 params, so provide a wrapper
CREATE OR REPLACE FUNCTION monsoon$dev.audit_table(target_table regclass, audit_rows boolean) RETURNS void AS $body$
SELECT monsoon$dev.audit_table($1, $2, ARRAY[]::text[]);
$body$ LANGUAGE SQL;

-- And provide a convenience call wrapper for the simplest case
-- of row-level logging with no excluded cols and query logging enabled.
--
CREATE OR REPLACE FUNCTION monsoon$dev.audit_table(target_table regclass) RETURNS void AS $body$
SELECT monsoon$dev.audit_table($1, BOOLEAN 't');
$body$ LANGUAGE 'sql';

COMMENT ON FUNCTION monsoon$dev.audit_table(regclass) IS $body$
Add auditing support to the given table. Row-level changes will be logged with full client query text. No cols are ignored.
$body$;

CREATE OR REPLACE VIEW monsoon$dev.tableslist AS 
 SELECT DISTINCT triggers.trigger_schema AS schema,
    triggers.event_object_table AS auditedtable
   FROM information_schema.triggers
    WHERE triggers.trigger_name::text IN ('audit_trigger_row'::text, 'audit_trigger_stm'::text)  
ORDER BY schema, auditedtable;

COMMENT ON VIEW monsoon$dev.tableslist IS $body$
View showing all tables with auditing set up. Ordered by schema, then table.
$body$;

--- Add logs to tables
SELECT monsoon$dev.audit_table('monsoon$dev."Customer"');
SELECT monsoon$dev.audit_table('monsoon$dev."User"');
SELECT monsoon$dev.audit_table('monsoon$dev."Product"');
SELECT monsoon$dev.audit_table('monsoon$dev."PhysicalProduct"');
SELECT monsoon$dev.audit_table('monsoon$dev."ProductVariant"');
SELECT monsoon$dev.audit_table('monsoon$dev."Brand"');
SELECT monsoon$dev.audit_table('monsoon$dev."Category"');
-- add more 