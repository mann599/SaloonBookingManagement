var providerDashboard = {
    bookings: [],
    bookingServicesMap: {},
    servicesMap: {},
    STATUS_NAMES: ["Pending", "Confirmed", "Completed", "Cancelled"],

    init: function() {
        if (!isLoggedIn()) {
            redirectToLogin();
            return;
        }
        if (!isProvider()) {
            window.location.href = "index.html";
            return;
        }
        updateNavForAuth();
        this.loadAll();
        var self = this;
        $(document).on("click", ".btn-update", function(e) {
            e.preventDefault();
            var id = $(this).data("id");
            self.updateStatus(id);
        });
    },

    loadAll: function() {
        $("#dashboard-error").text("");
        var self = this;
        $.when(
            $.ajax({ url: API_BASE + "/bookings", method: "GET" }),
            $.ajax({ url: API_BASE + "/bookingservices", method: "GET" }),
            $.ajax({ url: API_BASE + "/services", method: "GET" })
        ).done(function(bookingsResp, bookingServicesResp, servicesResp) {
            var bookings = bookingsResp[0];
            var bookingServices = bookingServicesResp[0];
            var services = servicesResp[0];
            if (!Array.isArray(bookings)) {
                $("#dashboard-error").text("Failed to load bookings.");
                return;
            }
            self.bookings = bookings;
            var servicesById = {};
            (services || []).forEach(function(s) {
                servicesById[s.id] = s.name;
            });
            var byBooking = {};
            (bookingServices || []).forEach(function(bs) {
                if (!byBooking[bs.bookingId]) byBooking[bs.bookingId] = [];
                if (servicesById[bs.serviceId]) byBooking[bs.bookingId].push(servicesById[bs.serviceId]);
            });
            self.bookingServicesMap = byBooking;
            self.servicesMap = servicesById;
            self.render(bookings);
        }).fail(function(xhr) {
            if (xhr && xhr.status === 401) redirectToLogin();
            else $("#dashboard-error").text("Failed to load data.");
        });
    },

    render: function(bookings) {
        var self = this;
        var html = "";
        if (!bookings || bookings.length === 0) {
            html = "<tr><td colspan='8'>No bookings.</td></tr>";
        } else {
            bookings.forEach(function(b) {
                var timeStr = typeof b.time === "string" ? b.time : (b.time || "").toString();
                if (timeStr.length >= 8) timeStr = timeStr.substring(0, 5);
                var serviceNames = (self.bookingServicesMap[b.id] || []).join(", ");
                if (!serviceNames) serviceNames = "—";
                var statusNum = typeof b.status === "number" ? b.status : self.STATUS_NAMES.indexOf(b.status);
                if (statusNum < 0) statusNum = 0;
                html += "<tr data-id='" + b.id + "'>" +
                    "<td>" + b.id + "</td>" +
                    "<td>" + b.userId + "</td>" +
                    "<td>" + (b.bookingDate || "") + "</td>" +
                    "<td>" + timeStr + "</td>" +
                    "<td class='services-cell'>" + escapeHtml(serviceNames) + "</td>" +
                    "<td><select class='status-select' data-id='" + b.id + "'>";
                for (var i = 0; i < self.STATUS_NAMES.length; i++) {
                    html += "<option value='" + i + "'" + (statusNum === i ? " selected" : "") + ">" + self.STATUS_NAMES[i] + "</option>";
                }
                html += "</select></td>" +
                    "<td>$" + parseFloat(b.totalAmount).toFixed(2) + "</td>" +
                    "<td><button type='button' class='btn btn-primary btn-sm btn-update' data-id='" + b.id + "'>Update</button></td>" +
                    "</tr>";
            });
        }
        $("#bookings-tbody").html(html);
    },

    updateStatus: function(id) {
        var b = this.bookings.find(function(x) { return x.id === id; });
        if (!b) return;
        var timeStr = typeof b.time === "string" ? b.time : (b.time || "").toString();
        if (timeStr.length === 5) timeStr = timeStr + ":00";
        var statusVal = $("#bookings-tbody select[data-id='" + id + "']").val();
        var statusNum = parseInt(statusVal, 10);
        if (isNaN(statusNum)) statusNum = 0;
        var payload = {
            userId: b.userId,
            bookingDate: b.bookingDate,
            time: timeStr,
            status: statusNum,
            totalAmount: b.totalAmount
        };
        var self = this;
        $.ajax({
            url: API_BASE + "/bookings/" + id,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(payload),
            success: function() {
                b.status = statusNum;
                self.render(self.bookings);
            },
            error: function(xhr) {
                if (xhr.status === 401) redirectToLogin();
                else alert("Failed to update status. " + (xhr.responseJSON && xhr.responseJSON.message ? xhr.responseJSON.message : xhr.responseText || ""));
            }
        });
    }
};

function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
