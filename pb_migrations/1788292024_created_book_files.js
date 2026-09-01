/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "collection_book_files",
    "created": "2026-09-01 19:47:04.559Z",
    "updated": "2026-09-01 19:47:04.559Z",
    "name": "book_files",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "bf_book",
        "name": "book",
        "type": "relation",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "collection_books",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "bf_file",
        "name": "ebook_file",
        "type": "file",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "mimeTypes": [],
          "thumbs": [],
          "maxSelect": 1,
          "maxSize": 524288000,
          "protected": true
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": "@request.auth.is_admin = true",
    "updateRule": "@request.auth.is_admin = true",
    "deleteRule": "@request.auth.is_admin = true",
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("collection_book_files");

  return dao.deleteCollection(collection);
})
