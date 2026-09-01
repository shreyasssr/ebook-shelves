/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "collection_languages",
    "created": "2026-09-01 19:47:04.559Z",
    "updated": "2026-09-01 19:47:04.559Z",
    "name": "languages",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "lang_code",
        "name": "code",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "lang_name",
        "name": "name",
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
        "id": "lang_native_name",
        "name": "native_name",
        "type": "text",
        "required": false,
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
        "id": "lang_is_active",
        "name": "is_active",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "lang_display_order",
        "name": "display_order",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_lang_code` ON `languages` (`code`)"
    ],
    "listRule": "is_active = true || @request.auth.is_admin = true",
    "viewRule": "is_active = true || @request.auth.is_admin = true",
    "createRule": "@request.auth.is_admin = true",
    "updateRule": "@request.auth.is_admin = true",
    "deleteRule": "@request.auth.is_admin = true",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("collection_languages");

  return dao.deleteCollection(collection);
})
