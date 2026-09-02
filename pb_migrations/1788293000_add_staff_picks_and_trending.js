migrate((db) => {
  const dao = new Dao(db);
  
  // 1. Add is_staff_pick to books
  const booksCol = dao.findCollectionByNameOrId("collection_books");
  booksCol.schema.addField(new SchemaField({
    "system": false,
    "id": "book_is_staff_pick",
    "name": "is_staff_pick",
    "type": "bool",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {}
  }));
  dao.saveCollection(booksCol);

  // 2. Create trending_books view collection
  const viewCol = new Collection({
    "id": "view_trending_books",
    "name": "trending_books",
    "type": "view",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "tb_book",
        "name": "book",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "collection_books",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      },
      {
        "system": false,
        "id": "tb_recent_sales",
        "name": "recent_sales",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": true
        }
      }
    ],
    "listRule": "",
    "viewRule": "",
    "options": {
      "query": "SELECT order_items.book as id, order_items.book as book, COUNT(order_items.id) as recent_sales FROM order_items LEFT JOIN orders ON order_items.`order` = orders.id WHERE orders.created > datetime('now', '-30 days') GROUP BY order_items.book"
    }
  });
  dao.saveCollection(viewCol);
  
}, (db) => {
  const dao = new Dao(db);
  
  // 1. Remove is_staff_pick from books
  const booksCol = dao.findCollectionByNameOrId("collection_books");
  booksCol.schema.removeField("book_is_staff_pick");
  dao.saveCollection(booksCol);
  
  // 2. Remove trending_books view
  const viewCol = dao.findCollectionByNameOrId("view_trending_books");
  dao.deleteCollection(viewCol);
});

