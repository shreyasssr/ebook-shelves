onRecordBeforeUpdateRequest((e) => {
    const authRecord = e.httpContext.get("authRecord");
    const isAuthAdmin = authRecord && authRecord.get("is_admin") === true;
    
    if (!isAuthAdmin) {
        const original = $app.dao().findRecordById("users", e.record.id);
        const originalIsAdmin = original.get("is_admin");
        
        // Overwrite any malicious change back to the original value
        e.record.set("is_admin", originalIsAdmin);
    }
}, "users");

onRecordBeforeCreateRequest((e) => {
    const authRecord = e.httpContext.get("authRecord");
    const isAuthAdmin = authRecord && authRecord.get("is_admin") === true;
    
    if (!isAuthAdmin) {
        // Force is_admin to false for public signups
        e.record.set("is_admin", false);
    }
}, "users");
