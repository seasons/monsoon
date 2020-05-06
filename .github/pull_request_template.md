## Changes

- Item 1
- Item 2
- Item 3

## Query / Responses

**Query**

Query

```
{
  products(first: 10) {
    id
    url
    name
    slug
  }
}
```

**Response**

```
{
  "data": {
    "products": [
      {
        "id": "ck7z7cf940i1i07191fcmy9lr",
        "name": "Le Blouson Valensole Tie-Dyed Cotton Jacket"
      },
      {
        "id": "ck7xu5ung04ov0719yu7cxtf2",
        "name": "Bandana Print Hoodie"
      },
      {
        "id": "ck7xu5hfm02sl0719pllefo0l",
        "name": "Corduroy Adjustable Work Pant"
      },
      {
        "id": "ck7uqjkrg15su081964po6xr0",
        "name": "Ribbed Crew"
      },
      ...
    ]
  }
}
```

## Testing

- [ ] Deploy to staging
- [ ] Run migrations
- [ ] Manually QA update
- [ ] Get approval from stakeholder
- [ ] Determine production deploy timing

## Production Ready

- [ ] Deploy to production
- [ ] Run migrations
- [ ] Sanity check on production
- [ ] Monitor logs for errors

Fixes #85, Fixes #22, Fixes username/repo#123
Connects #123
