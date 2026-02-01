var providerDashboard = {
    bookings: [],
    bookingServicesMap: {},
    servicesMap: {},
    categoriesMap: {},
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
        this.initTabs();
        this.initModals();
        this.loadAll();
        this.initEventHandlers();
        this.initRefreshButton();
    },

    initTabs: function() {
        var self = this;
        $('.tab-btn').on('click', function() {
            $('.tab-btn').removeClass('active');
            $('.tab-content').removeClass('active');
            
            $(this).addClass('active');
            var tabId = $(this).data('tab');
            $('#' + tabId + '-tab').addClass('active');
            
            if (tabId === 'services') {
                self.loadServices();
            } else if (tabId === 'categories') {
                self.loadCategories();
            }
        });
    },

    initModals: function() {
        var self = this;
        
        // Test upload endpoint availability
        self.testUploadEndpoint();
        
        // Service modal
        $('#add-service-btn').on('click', function() {
            self.openServiceModal();
        });
        
        $('.modal-close, .modal-cancel').on('click', function() {
            self.closeModals();
        });
        
        $('#service-form').on('submit', function(e) {
            e.preventDefault();
            self.saveService();
        });
        
        // Image upload handling
        $('#service-image').on('change', function(e) {
            self.previewImage(e.target.files[0]);
        });
        
        // Category modal
        $('#add-category-btn').on('click', function() {
            self.openCategoryModal();
        });
        
        $('#category-form').on('submit', function(e) {
            e.preventDefault();
            self.saveCategory();
        });
        
        // Close modal on outside click
        $('.modal').on('click', function(e) {
            if (e.target === this) {
                self.closeModals();
            }
        });
    },

    testUploadEndpoint: function() {
        // Simple test to see if upload endpoint exists
        $.ajax({
            url: API_BASE + "/upload",
            method: "OPTIONS",
            success: function() {
                console.log('Upload endpoint is accessible');
            },
            error: function(xhr) {
                console.warn('Upload endpoint may not be available:', xhr.status);
                // If upload endpoint doesn't exist, we'll handle it in the save function
            }
        });
    },

    initRefreshButton: function() {
        var self = this;
        $('#refresh-bookings').on('click', function() {
            self.loadAll();
        });
    },

    updateStats: function() {
        var self = this;
        var totalBookings = self.bookings.length;
        var pendingBookings = 0;
        var confirmedBookings = 0;
        var totalServices = Object.keys(self.servicesMap).length;
        
        self.bookings.forEach(function(booking) {
            var status = typeof booking.status === "number" ? booking.status : self.STATUS_NAMES.indexOf(booking.status);
            if (status === 0) pendingBookings++;
            else if (status === 1) confirmedBookings++;
        });
        
        $('#total-bookings').text(totalBookings);
        $('#pending-bookings').text(pendingBookings);
        $('#confirmed-bookings').text(confirmedBookings);
        $('#total-services').text(totalServices);
    },

    initEventHandlers: function() {
        var self = this;
        $(document).on("click", ".btn-update", function(e) {
            e.preventDefault();
            var id = $(this).data("id");
            self.updateStatus(id);
        });
    },

    openServiceModal: function(serviceId) {
        var self = this;
        var modal = $('#service-modal');
        var title = $('#service-modal-title');
        
        if (serviceId) {
            title.text('Edit Service');
            self.loadServiceForEdit(serviceId);
        } else {
            title.text('Add New Service');
            self.resetServiceForm();
            self.loadCategoriesForSelect();
        }
        
        modal.css('display', 'block');
    },

    openCategoryModal: function(categoryId) {
        var self = this;
        var modal = $('#category-modal');
        var title = $('#category-modal-title');
        
        if (categoryId) {
            title.text('Edit Category');
            self.loadCategoryForEdit(categoryId);
        } else {
            title.text('Add New Category');
            self.resetCategoryForm();
        }
        
        modal.css('display', 'block');
    },

    closeModals: function() {
        $('.modal').css('display', 'none');
    },

    resetServiceForm: function() {
        $('#service-form')[0].reset();
        $('#service-id').val('');
        $('#image-preview').html('<div class="placeholder"><i class="fas fa-image"></i>No image selected</div>');
    },

    resetCategoryForm: function() {
        $('#category-form')[0].reset();
        $('#category-id').val('');
    },

    loadAll: function() {
        $("#dashboard-error").text("");
        var self = this;
        $.when(
            $.ajax({ url: API_BASE + "/bookings", method: "GET" }),
            $.ajax({ url: API_BASE + "/bookingservices", method: "GET" }),
            $.ajax({ url: API_BASE + "/services", method: "GET" }),
            $.ajax({ url: API_BASE + "/categories", method: "GET" })
        ).done(function(bookingsResp, bookingServicesResp, servicesResp, categoriesResp) {
            var bookings = bookingsResp[0];
            var bookingServices = bookingServicesResp[0];
            var services = servicesResp[0];
            var categories = categoriesResp[0];
            
            if (!Array.isArray(bookings)) {
                $("#dashboard-error").text("Failed to load bookings.");
                return;
            }
            
            self.bookings = bookings;
            
            // Build services map
            var servicesById = {};
            (services || []).forEach(function(s) {
                servicesById[s.id] = s.name;
            });
            
            // Build categories map
            var categoriesById = {};
            (categories || []).forEach(function(c) {
                categoriesById[c.id] = c.name;
            });
            
            var byBooking = {};
            (bookingServices || []).forEach(function(bs) {
                if (!byBooking[bs.bookingId]) byBooking[bs.bookingId] = [];
                if (servicesById[bs.serviceId]) byBooking[bs.bookingId].push(servicesById[bs.serviceId]);
            });
            
            self.bookingServicesMap = byBooking;
            self.servicesMap = servicesById;
            self.categoriesMap = categoriesById;
            self.render(bookings);
            self.updateStats();
        }).fail(function(xhr) {
            if (xhr && xhr.status === 401) redirectToLogin();
            else $("#dashboard-error").text("Failed to load data.");
        });
    },

    loadServices: function() {
        var self = this;
        $('#services-error').text('');
        
        $.get(API_BASE + "/services")
            .done(function(services) {
                self.renderServices(services);
            })
            .fail(function(xhr) {
                $('#services-error').text('Failed to load services.');
            });
    },

    loadCategories: function() {
        var self = this;
        $('#categories-error').text('');
        
        $.get(API_BASE + "/categories")
            .done(function(categories) {
                self.renderCategories(categories);
            })
            .fail(function(xhr) {
                $('#categories-error').text('Failed to load categories.');
            });
    },

    loadCategoriesForSelect: function() {
        var self = this;
        $.get(API_BASE + "/categories")
            .done(function(categories) {
                var select = $('#service-category');
                select.html('<option value="">Select Category</option>');
                categories.forEach(function(cat) {
                    select.append('<option value="' + cat.id + '">' + escapeHtml(cat.name) + '</option>');
                });
            })
            .fail(function() {
                $('#services-error').text('Failed to load categories.');
            });
    },

    loadServiceForEdit: function(serviceId) {
        var self = this;
        $.get(API_BASE + "/services/" + serviceId)
            .done(function(service) {
                $('#service-id').val(service.id);
                $('#service-name').val(service.name);
                $('#service-price').val(service.price);
                $('#service-duration').val(service.duration);
                $('#service-description').val(service.description || '');
                
                // Handle image preview
                if (service.image) {
                    $('#image-preview').html('<img src="' + service.image + '" alt="Service Image">');
                } else {
                    $('#image-preview').html('<div class="placeholder"><i class="fas fa-image"></i>No image selected</div>');
                }
                
                self.loadCategoriesForSelect();
                setTimeout(function() {
                    $('#service-category').val(service.categoryId);
                }, 100);
            })
            .fail(function() {
                $('#services-error').text('Failed to load service details.');
            });
    },

    previewImage: function(file) {
        var preview = $('#image-preview');
        if (file) {
            if (file.type.startsWith('image/')) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    preview.html('<img src="' + e.target.result + '" alt="Preview">');
                };
                reader.readAsDataURL(file);
            } else {
                preview.html('<div class="placeholder"><i class="fas fa-exclamation-triangle"></i>Please select an image file</div>');
            }
        } else {
            preview.html('<div class="placeholder"><i class="fas fa-image"></i>No image selected</div>');
        }
    },

    loadCategoryForEdit: function(categoryId) {
        $.get(API_BASE + "/categories/" + categoryId)
            .done(function(category) {
                $('#category-id').val(category.id);
                $('#category-name').val(category.name);
            })
            .fail(function() {
                $('#categories-error').text('Failed to load category details.');
            });
    },

    saveService: function() {
        var self = this;
        var serviceId = $('#service-id').val();
        var isEdit = serviceId !== '';
        var imageFile = $('#service-image')[0].files[0];
        
        var serviceData = {
            name: $('#service-name').val(),
            categoryId: parseInt($('#service-category').val()),
            price: parseFloat($('#service-price').val()),
            duration: parseInt($('#service-duration').val()),
            description: $('#service-description').val(),
            image: imageFile ? imageFile.name : null
        };
        
        if (imageFile) {
            // If there's an image, upload it first
            var formData = new FormData();
            
            // Try different parameter names that match common backend patterns
            formData.append('file', imageFile);  // Most common for ASP.NET
            
            // Show loading state
            $('#services-error').text('Uploading image...');
            
            // Try multiple possible upload endpoints in service controller
            var possibleEndpoints = [
                API_BASE + "/services/upload", 
            ];
            
            self.tryUploadEndpoints(possibleEndpoints, formData, 0, serviceData, isEdit, serviceId);
        } else {
            // No new image, just save service data
            self.saveServiceData(serviceData, isEdit, serviceId);
        }
    },

    tryUploadEndpoints: function(endpoints, formData, index, serviceData, isEdit, serviceId) {
        var self = this;
        
        if (index >= endpoints.length) {
            $('#services-error').text('All upload endpoints failed. Upload endpoint may not exist.');
            return;
        }
        
        var currentEndpoint = endpoints[index];
        console.log('Trying upload endpoint:', currentEndpoint);
        
        $.ajax({
            url: currentEndpoint,
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('Upload successful at:', currentEndpoint);
                console.log('Upload response:', response);
                
                // Handle different response formats
                var imageUrl = response.imageUrl || response.image || response.url || response.path;
                if (imageUrl) {
                    serviceData.image = imageUrl;
                    $('#services-error').text(''); // Clear error message
                    self.saveServiceData(serviceData, isEdit, serviceId);
                } else {
                    $('#services-error').text('Image uploaded but no URL received');
                }
            },
            error: function(xhr) {
                console.error('Upload failed at:', currentEndpoint);
                console.error('Status:', xhr.status);
                console.error('Response:', xhr.responseText);
            }
        });
    },

    saveServiceData: function(serviceData, isEdit, serviceId) {
        var self = this;
        var url = isEdit ? API_BASE + "/services/" + serviceId : API_BASE + "/services";
        var method = isEdit ? "PUT" : "POST";
        
        $.ajax({
            url: url,
            method: method,
            contentType: "application/json",
            data: JSON.stringify(serviceData),
            success: function() {
                self.closeModals();
                self.loadServices();
                self.loadAll(); // Refresh bookings data too
            },
            error: function(xhr) {
                var errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to save service.';
                $('#services-error').text(errorMsg);
                
                // If this was an edit with a new image that failed, offer to save without image
                if (isEdit && serviceData.image && $('#service-image')[0].files[0]) {
                    if (confirm('Image upload failed. Would you like to save the service without the image?')) {
                        // Remove image and try again
                        delete serviceData.image;
                        self.saveServiceData(serviceData, isEdit, serviceId);
                    }
                }
            }
        });
    },

    saveCategory: function() {
        var self = this;
        var categoryId = $('#category-id').val();
        var isEdit = categoryId !== '';
        
        var categoryData = {
            name: $('#category-name').val()
        };
        
        var url = isEdit ? API_BASE + "/categories/" + categoryId : API_BASE + "/categories";
        var method = isEdit ? "PUT" : "POST";
        
        $.ajax({
            url: url,
            method: method,
            contentType: "application/json",
            data: JSON.stringify(categoryData),
            success: function() {
                self.closeModals();
                self.loadCategories();
                self.loadAll(); // Refresh services data too
            },
            error: function(xhr) {
                var errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to save category.';
                $('#categories-error').text(errorMsg);
            }
        });
    },

    deleteService: function(serviceId) {
        if (!confirm('Are you sure you want to delete this service?')) {
            return;
        }
        
        var self = this;
        $.ajax({
            url: API_BASE + "/services/" + serviceId,
            method: "DELETE",
            success: function() {
                self.loadServices();
                self.loadAll(); // Refresh bookings data too
            },
            error: function(xhr) {
                var errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to delete service.';
                $('#services-error').text(errorMsg);
            }
        });
    },

    deleteCategory: function(categoryId) {
        if (!confirm('Are you sure you want to delete this category? This will also delete all services in this category.')) {
            return;
        }
        
        var self = this;
        $.ajax({
            url: API_BASE + "/categories/" + categoryId,
            method: "DELETE",
            success: function() {
                self.loadCategories();
                self.loadAll(); // Refresh services data too
            },
            error: function(xhr) {
                var errorMsg = xhr.responseJSON ? xhr.responseJSON.message : 'Failed to delete category.';
                $('#categories-error').text(errorMsg);
            }
        });
    },

    renderServices: function(services) {
        var self = this;
        var html = "";
        
        if (!services || services.length === 0) {
            html = "<tr><td colspan='7'>No services found.</td></tr>";
        } else {
            services.forEach(function(s) {
                var categoryName = self.categoriesMap[s.categoryId] || 'Unknown';
                var imageHtml = s.image ? '<img src="' + s.image + '" alt="' + escapeHtml(s.name) + '" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">' : '<div style="width: 50px; height: 50px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 0.8rem;">No Image</div>';
                
                html += "<tr>" +
                    "<td>" + s.id + "</td>" +
                    "<td>" + imageHtml + "</td>" +
                    "<td>" + escapeHtml(s.name) + "</td>" +
                    "<td>" + escapeHtml(categoryName) + "</td>" +
                    "<td>$" + parseFloat(s.price).toFixed(2) + "</td>" +
                    "<td>" + s.duration + " min</td>" +
                    "<td>" +
                    "<div class='action-buttons'>" +
                    "<button class='btn-edit' onclick='providerDashboard.openServiceModal(" + s.id + ")'>" +
                    "<i class='fas fa-edit'></i> Edit" +
                    "</button>" +
                    "<button class='btn-delete' onclick='providerDashboard.deleteService(" + s.id + ")'>" +
                    "<i class='fas fa-trash'></i> Delete" +
                    "</button>" +
                    "</div>" +
                    "</td>" +
                    "</tr>";
            });
        }
        
        $("#services-tbody").html(html);
    },

    renderCategories: function(categories) {
        var html = "";
        
        if (!categories || categories.length === 0) {
            html = "<tr><td colspan='3'>No categories found.</td></tr>";
        } else {
            categories.forEach(function(c) {
                html += "<tr>" +
                    "<td>" + c.id + "</td>" +
                    "<td>" + escapeHtml(c.name) + "</td>" +
                    "<td>" +
                    "<div class='action-buttons'>" +
                    "<button class='btn-edit' onclick='providerDashboard.openCategoryModal(" + c.id + ")'>" +
                    "<i class='fas fa-edit'></i> Edit" +
                    "</button>" +
                    "<button class='btn-delete' onclick='providerDashboard.deleteCategory(" + c.id + ")'>" +
                    "<i class='fas fa-trash'></i> Delete" +
                    "</button>" +
                    "</div>" +
                    "</td>" +
                    "</tr>";
            });
        }
        
        $("#categories-tbody").html(html);
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
