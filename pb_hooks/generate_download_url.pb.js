routerAdd("POST", "/api/generate-download-url", (c) => {
    // 1. Require authentication
    const user = c.get("authRecord");
    if (!user) {
        throw new ForbiddenError("Authentication required.");
    }

    // 2. Read download_id
    const body = $apis.requestInfo(c).data;
    const download_id = body.download_id;
    if (!download_id) {
        throw new BadRequestError("download_id is required.");
    }

    // 3. Look up digital_downloads
    let dd;
    try {
        dd = $app.dao().findRecordById("digital_downloads", download_id);
    } catch (e) {
        throw new NotFoundError("Download record not found.");
    }

    // Verify ownership
    if (dd.getString("user") !== user.id && user.getBool("is_admin") !== true) {
        throw new ForbiddenError("You do not have permission to access this download.");
    }

    if (dd.getBool("is_active") !== true) {
        throw new ForbiddenError("This download has been deactivated.");
    }

    const expiresAt = dd.getDateTime("expires_at");
    if (expiresAt.time().Unix() > 0 && expiresAt.time().Unix() < new Date().getTime() / 1000) {
        throw new ForbiddenError("Access expired. Contact support if you need it again.");
    }

    if (dd.getInt("download_count") >= dd.getInt("max_downloads")) {
        throw new ForbiddenError(`You've used all ${dd.getInt("max_downloads")} downloads for this book. Contact support if you need another.`);
    }

    // Check order status
    let order;
    try {
        order = $app.dao().findRecordById("orders", dd.getString("order"));
    } catch (e) {
        throw new NotFoundError("Associated order not found.");
    }
    
    if (order.getString("status") !== "paid") {
        throw new ForbiddenError("The associated order has not been paid.");
    }

    // Look up protected file
    const book_id = dd.getString("book");
    const bookFiles = $app.dao().findRecordsByExpr("book_files", $dbx.hashExp({ book: book_id }));
    if (!bookFiles || bookFiles.length === 0) {
        throw new NotFoundError("Protected ebook file not found for this book.");
    }
    const bookFile = bookFiles[0];

    // 4. Increment download_count
    dd.set("download_count", dd.getInt("download_count") + 1);
    $app.dao().saveRecord(dd);

    // 5. Generate file token and URL
    // file url format: /api/files/collectionId/recordId/filename?token=...
    const token = $tokens.recordFileToken(user);
    const filename = bookFile.getString("ebook_file");
    const fileUrl = `/api/files/${bookFile.collection().id}/${bookFile.id}/${filename}?token=${token}`;

    return c.json(200, {
        url: fileUrl
    });
}, $apis.requireRecordAuth());
