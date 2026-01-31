var bookingPage = {
    services: [],

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
        this.loadServices();
        this.bindEvents();
    },

    loadServices: function() {
        $.ajax({
            url: API_BASE + "/services",
            headers: { "Authorization": "Bearer " + getToken() },
            method: "GET"
        })
            .done(function(services) {
                bookingPage.services = services;
                var html = "";
                services.forEach(function(s) {
                    html += '<label><input type="checkbox" name="serviceId" value="' + s.id + '" data-price="' + s.price + '"> ' + escapeHtml(s.name) + ' &ndash; $' + s.price + ' (' + s.duration + ' min)</label>';
                });
                $("#services-checkboxes").html(html || "<p>No services.</p>");
                bookingPage.updateTotal();
            })
            .fail(function() {
                $("#services-checkboxes").html("<p>Failed to load services.</p>");
            });
    },

    bindEvents: function() {
        var self = this;
        $("#services-checkboxes").on("change", "input[type=checkbox]", function() {
            self.updateTotal();
        });
        $("#booking-form").on("submit", function(e) {
            e.preventDefault();
            self.submitBooking();
        });
    },

    updateTotal: function() {
        var total = 0;
        $("#services-checkboxes input:checked").each(function() {
            total += parseFloat($(this).data("price")) || 0;
        });
        $("#booking-total").text("Total: $" + total.toFixed(2));
    },

    submitBooking: function() {
        $("#booking-error").text("");
        var date = $("#booking-date").val();
        var time = $("#booking-time").val();
        var serviceIds = [];
        $("#services-checkboxes input:checked").each(function() {
            serviceIds.push(parseInt($(this).val(), 10));
        });
        if (!date || !time) {
            $("#booking-error").text("Date and time are required.");
            return;
        }
        if (serviceIds.length === 0) {
            $("#booking-error").text("Select at least one service.");
            return;
        }
        if (time.length === 5) {
            time = time + ":00";
        }
        var payload = {
            bookingDate: date,
            time: time,
            serviceIds: serviceIds
        };
        $.ajax({
            url: API_BASE + "/bookings",
            method: "POST",
            contentType: "application/json",
            headers: { "Authorization": "Bearer " + getToken() },
            data: JSON.stringify(payload),
            success: function() {
                window.location.href = "my-bookings.html";
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    redirectToLogin();
                    return;
                }
                $("#booking-error").text(xhr.status === 400 ? (xhr.responseJSON || xhr.responseText || "Invalid request.") : "Booking failed.");
            }
        });
    }
};

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
