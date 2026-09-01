/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "collection_orders",
    "created": "2026-09-01 19:47:04.560Z",
    "updated": "2026-09-01 19:47:04.560Z",
    "name": "orders",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ord_user",
        "name": "user",
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
        "id": "ord_cust_name",
        "name": "customer_name",
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
        "id": "ord_cust_email",
        "name": "customer_email",
        "type": "email",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "system": false,
        "id": "ord_total",
        "name": "total_amount",
        "type": "number",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "ord_status",
        "name": "status",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "paid",
            "failed",
            "refunded"
          ]
        }
      },
      {
        "system": false,
        "id": "ord_method",
        "name": "payment_method",
        "type": "select",
        "required": true,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "razorpay",
            "cod"
          ]
        }
      },
      {
        "system": false,
        "id": "ord_ref",
        "name": "payment_reference_id",
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
        "id": "ord_access_date",
        "name": "access_granted_at",
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
    "listRule": "user = @request.auth.id || @request.auth.is_admin = true",
    "viewRule": "user = @request.auth.id || @request.auth.is_admin = true",
    "createRule": null,
    "updateRule": "@request.auth.is_admin = true",
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("collection_orders");

  return dao.deleteCollection(collection);
})
