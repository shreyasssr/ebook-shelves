routerAdd("POST", "/api/place-order", (c) => {
    // 1. Require an authenticated request
    const user = c.get("authRecord");
    if (!user) {
        throw new ForbiddenError("Authentication required.");
    }

    // 2. Read and validate request body
    const body = $apis.requestInfo(c).data;
    const { book_ids, customer_name, customer_email, payment_method } = body;

    if (!Array.isArray(book_ids) || book_ids.length === 0) {
        throw new BadRequestError("book_ids must be a non-empty array.");
    }
    if (!customer_name || typeof customer_name !== "string" || customer_name.trim() === "") {
        throw new BadRequestError("customer_name is required.");
    }
    if (!customer_email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer_email)) {
        throw new BadRequestError("A valid customer_email is required.");
    }
    if (payment_method !== "razorpay" && payment_method !== "cod") {
        throw new BadRequestError("payment_method must be razorpay or cod.");
    }

    // 3. Look up books and 4. Compute total
    const booksToBuy = [];
    let total_amount = 0;

    for (const id of book_ids) {
        let bookRecord;
        try {
            bookRecord = $app.dao().findRecordById("books", id);
        } catch (e) {
            throw new NotFoundError(`Book ${id} not found.`);
        }

        if (bookRecord.getBool("is_published") !== true) {
            throw new BadRequestError(`Book ${id} is not published.`);
        }

        const price = bookRecord.getFloat("price");
        const discount = bookRecord.get("discount_price");
        const finalPrice = (discount !== null && discount > 0 && discount < price) ? discount : price;

        booksToBuy.push({ record: bookRecord, finalPrice });
        total_amount += finalPrice;
    }

    let createdOrderId = null;

    // 10. Wrap in transaction
    $app.dao().runInTransaction((txDao) => {
        // 5. Create order record
        const ordersCollection = txDao.findCollectionByNameOrId("orders");
        const orderRecord = new Record(ordersCollection);
        orderRecord.set("user", user.id);
        orderRecord.set("customer_name", customer_name);
        orderRecord.set("customer_email", customer_email);
        orderRecord.set("total_amount", total_amount);
        orderRecord.set("status", "paid"); // Stubbed as paid
        orderRecord.set("payment_method", payment_method);
        orderRecord.set("access_granted_at", new Date().toISOString());
        txDao.saveRecord(orderRecord);
        createdOrderId = orderRecord.id;

        const orderItemsCollection = txDao.findCollectionByNameOrId("order_items");
        const downloadsCollection = txDao.findCollectionByNameOrId("digital_downloads");

        for (const item of booksToBuy) {
            const book = item.record;

            // 6. Create order_item
            const oi = new Record(orderItemsCollection);
            oi.set("order", orderRecord.id);
            oi.set("book", book.id);
            oi.set("book_name", book.getString("name"));
            oi.set("author", book.getString("author"));
            oi.set("unit_price", item.finalPrice);
            txDao.saveRecord(oi);

            // 7. Create digital_download
            const dd = new Record(downloadsCollection);
            dd.set("order", orderRecord.id);
            dd.set("book", book.id);
            dd.set("user", user.id);
            dd.set("download_count", 0);
            dd.set("max_downloads", 5);
            
            // expires_at: 1 year from now
            const expires = new Date();
            expires.setFullYear(expires.getFullYear() + 1);
            dd.set("expires_at", expires.toISOString());
            dd.set("is_active", true);
            txDao.saveRecord(dd);

            // 8. Increment book sales_count
            book.set("sales_count", book.getInt("sales_count") + 1);
            txDao.saveRecord(book);
        }
    });

    // 9. Return JSON
    return c.json(200, {
        order_id: createdOrderId,
        total_amount: total_amount
    });
}, $apis.requireRecordAuth());
