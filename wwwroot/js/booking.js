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
        this.loadUserDetails();
        this.loadServices();
        this.bindEvents();
    },

    loadUserDetails: function() {
        var self = this;
        
        // First try to get user info from common localStorage keys
        var storedName = localStorage.getItem('name') || 
                        localStorage.getItem('userName') || 
                        localStorage.getItem('fullname') || 
                        localStorage.getItem('fullName') || 
                        localStorage.getItem('user_name') || 
                        localStorage.getItem('user_fullname');
        
        var storedEmail = localStorage.getItem('email') || 
                          localStorage.getItem('userEmail') || 
                          localStorage.getItem('user_email');
        
        // If we have stored info, use it
        if (storedName) {
            self.user = {
                name: storedName,
                email: storedEmail || 'user@example.com',
                userId: localStorage.getItem('userId') || localStorage.getItem('user_id') || 'unknown'
            };
            self.updateUserDisplay();
            return;
        }
        
        // Try to parse JWT token if no stored info
        var token = getToken();
        if (token) {
            try {
                // Parse JWT token to get user info (if it's a JWT)
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                var decodedToken = JSON.parse(jsonPayload);
                
                // Try multiple possible name fields
                var name = decodedToken.name || 
                           decodedToken.fullName || 
                           decodedToken.given_name || 
                           decodedToken.firstName || 
                           decodedToken.lastname || 
                           decodedToken.lastName || 
                           decodedToken.username || 
                           decodedToken.sub || 
                           decodedToken.email || 
                           'Guest User';
                
                self.user = {
                    name: name,
                    email: decodedToken.email || decodedToken.email_address || decodedToken.sub || 'user@example.com',
                    userId: decodedToken.userId || decodedToken.sub || decodedToken.nameid || decodedToken.user_id || 'unknown'
                };
                
                // Store the name for future use
                localStorage.setItem('name', self.user.name);
                if (self.user.email !== 'user@example.com') {
                    localStorage.setItem('email', self.user.email);
                }
                
                self.updateUserDisplay();
            } catch (e) {
                console.error('JWT parsing failed:', e);
                // Final fallback
                self.user = {
                    name: 'Guest User',
                    email: 'user@example.com',
                    userId: 'unknown'
                };
                self.updateUserDisplay();
            }
        } else {
            // Final fallback if no token
            self.user = {
                name: 'Guest User',
                email: 'user@example.com',
                userId: 'unknown'
            };
            self.updateUserDisplay();
        }
    },

    updateUserDisplay: function() {
        if (this.user) {
            // Update form readonly fields
            $('#user-name').val(this.user.name);
            $('#user-email').val(this.user.email);
        }
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
                    html += '<div class="service-item">' +
                            '<label class="service-label">' +
                            '<input type="checkbox" name="serviceId" value="' + s.id + '" data-price="' + s.price + '" class="service-checkbox">' +
                            '<span class="checkmark"></span>' +
                            '<div class="service-info">' +
                            '<div class="service-name">' + escapeHtml(s.name) + '</div>' +
                            '<div class="service-details">$' + s.price + ' (' + s.duration + ' min)</div>' +
                            '</div>' +
                            '</label>' +
                            '</div>';
                });
                $("#services-checkboxes").html(html || "<p>No services available.</p>");
                
                // Initialize count and total
                setTimeout(function() {
                    bookingPage.updateTotal();
                }, 100);
            })
            .fail(function() {
                $("#services-checkboxes").html("<p>Failed to load services.</p>");
                // Still update total to show 0
                bookingPage.updateTotal();
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
        var count = 0;
        
        // Count checked services
        $("#services-checkboxes input:checked").each(function() {
            total += parseFloat($(this).data("price")) || 0;
            count++;
            // Add selected class to parent service item
            $(this).closest('.service-item').addClass('selected');
        });
        
        // Remove selected class from unselected items
        $("#services-checkboxes input:not(:checked)").each(function() {
            $(this).closest('.service-item').removeClass('selected');
        });
        
        // Update displays with fallback values
        var totalElement = $("#booking-total");
        var countElement = $("#selected-count");
        
        if (totalElement.length) {
            totalElement.text("$" + total.toFixed(2));
        }
        
        if (countElement.length) {
            countElement.text(count);
        }
        
        // Debug logging
        console.log('Services updated - Count:', count, 'Total:', total);
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
