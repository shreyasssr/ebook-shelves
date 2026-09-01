/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "collection_bulk_import_jobs",
    "created": "2026-09-01 19:47:04.560Z",
    "updated": "2026-09-01 19:47:04.560Z",
    "name": "bulk_import_jobs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "bij_admin",
        "name": "admin",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "bij_filename",
        "name": "filename",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "bij_total",
        "name": "total_rows",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "bij_success",
        "name": "success_rows",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "bij_error",
        "name": "error_rows",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": true
        }
      },
      {
        "system": false,
        "id": "bij_log",
        "name": "error_log",
        "type": "json",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSize": 2000000
        }
      },
      {
        "system": false,
        "id": "bij_status",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "processing",
            "completed"
          ]
        }
      },
      {
        "system": false,
        "id": "bij_completed",
        "name": "completed_at",
        "type": "date",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      }
    ],
    "indexes": [],
    "listRule": "@request.auth.is_admin = true",
    "viewRule": "@request.auth.is_admin = true",
    "createRule": "@request.auth.is_admin = true",
    "updateRule": "@request.auth.is_admin = true",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("collection_bulk_import_jobs");

  return dao.deleteCollection(collection);
})
