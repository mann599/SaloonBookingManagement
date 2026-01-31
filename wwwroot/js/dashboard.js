var dashboard = {
    init: function() {
        if (!isLoggedIn()) {
            redirectToLogin();
            return;
        }
        if (isProvider()) {
            window.location.href = "provider-dashboard.html";
            return;
        }
        updateNavForAuth();
        this.loadBookings();
        $("#status-filter").on("change", function() {
            dashboard.loadBookings();
        });
    },

    loadBookings: function() {
        var status = $("#status-filter").val();
        var url = API_BASE + "/bookings/my";
        if (status) {
            url += "?status=" + encodeURIComponent(status);
        }
        $.ajax({
            url: url,
            method: "GET",
            headers: { "Authorization": "Bearer " + getToken() }
        })
            .done(function(bookings) {
                var html = "";
                if (bookings.length === 0) {
                    html = "<p>No bookings found.</p>";
                } else {
                    bookings.forEach(function(b) {
                        var dateStr = b.bookingDate || b.bookingDate;
                        var timeStr = typeof b.time === "string" ? b.time : (b.time || "").toString();
                        if (timeStr && timeStr.length === 8) {
                            timeStr = timeStr.substring(0, 5);
                        }
                        html += '<div class="card-item"><h3>Booking #' + b.id + '</h3><p>Date: ' + dateStr + ' &ndash; Time: ' + timeStr + '</p><p>Status: ' + b.status + ' &ndash; Total: $' + parseFloat(b.totalAmount).toFixed(2) + '</p></div>';
                    });
                }
                $("#bookings-list").html(html);
            })
            .fail(function(xhr) {
                if (xhr.status === 401) {
                    redirectToLogin();
                    return;
                }
                $("#bookings-list").html("<p>Failed to load bookings.</p>");
            });
    }
};
