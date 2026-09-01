/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "collection_categories",
    "created": "2026-09-01 19:47:04.559Z",
    "updated": "2026-09-01 19:47:04.559Z",
    "name": "categories",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "cat_name",
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
        "id": "cat_slug",
        "name": "slug",
        "type": "text",
        "required": true,
        "presentable": false,
        "unique": true,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_cat_slug` ON `categories` (`slug`)"
    ],
    "listRule": "",
    "viewRule": "",
    "createRule": "@request.auth.is_admin = true",
    "updateRule": "@request.auth.is_admin = true",
    "deleteRule": "@request.auth.is_admin = true",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("collection_categories");

  return dao.deleteCollection(collection);
})
