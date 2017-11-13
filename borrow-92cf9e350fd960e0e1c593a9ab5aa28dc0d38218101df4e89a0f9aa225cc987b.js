
/*

  BorrowBookingCalendar

  This script setups the jquery FullCalendar plugin and adds functionalities

  for booking processes, used for the borrow section (customers)
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.BorrowBookingCalendar = (function(superClass) {
    extend(BorrowBookingCalendar, superClass);

    function BorrowBookingCalendar() {
      this.isClosedDay = bind(this.isClosedDay, this);
      this.getInventoryPool = bind(this.getInventoryPool, this);
      this.setupInventoryPoolSelector = bind(this.setupInventoryPoolSelector, this);
      this.getHolidays = bind(this.getHolidays, this);
      this.setQuantityText = bind(this.setQuantityText, this);
      this.setDayElement = bind(this.setDayElement, this);
      this.getGroupIds = bind(this.getGroupIds, this);
      this.getAvailability = bind(this.getAvailability, this);
      return BorrowBookingCalendar.__super__.constructor.apply(this, arguments);
    }

    BorrowBookingCalendar.prototype.setup = function(options) {
      this.ipSelector_el = options.ipSelectorEl != null ? options.ipSelectorEl : this.el.find("select#inventory_pool_id");
      return this.setupInventoryPoolSelector();
    };

    BorrowBookingCalendar.prototype.getAvailability = function() {
      return this.ipSelector_el.find("option:selected").data("availability");
    };

    BorrowBookingCalendar.prototype.getGroupIds = function() {
      return this.groupIds;
    };

    BorrowBookingCalendar.prototype.setDayElement = function(date, dayElement, holidays) {
      var available, availableQuantity, requiredQuantity;
      requiredQuantity = parseInt(this.quantity_el.val());
      availableQuantity = this.getAvailability().maxAvailableForGroups(date, date, this.getGroupIds());
      available = availableQuantity >= requiredQuantity;
      if (!this.isClosedDay(date) && !holidays.length) {
        this.setQuantityText(dayElement, availableQuantity);
      }
      this.setAvailability(dayElement, available);
      return this.setSelected(dayElement, date);
    };

    BorrowBookingCalendar.prototype.setQuantityText = function(dayElement, availableQuantity) {
      return dayElement.find(".fc-day-content > div").text(availableQuantity);
    };

    BorrowBookingCalendar.prototype.getHolidays = function() {
      return this.ipSelector_el.find("option:selected").data("holidays");
    };

    BorrowBookingCalendar.prototype.setupInventoryPoolSelector = function() {
      this.ipSelector_el.find("option:first").select();
      this.ipSelector_el.bind("change", (function(_this) {
        return function() {
          var av;
          av = _this.ipSelector_el.find("option:selected").data("availability");
          _this.setMaxQuantity(av.total_borrowable);
          return _this.render();
        };
      })(this));
      return this.ipSelector_el.change();
    };

    BorrowBookingCalendar.prototype.getInventoryPool = function() {
      return App.InventoryPool.find(this.ipSelector_el.find("option:selected").data("id"));
    };

    BorrowBookingCalendar.prototype.isClosedDay = function(date) {
      var ip;
      ip = this.getInventoryPool();
      return BorrowBookingCalendar.__super__.isClosedDay.apply(this, arguments) || !ip.isVisitPossible(moment(date)) || !ip.hasEnoughReservationAdvanceDays(date);
    };

    return BorrowBookingCalendar;

  })(App.BookingCalendar);

}).call(this);
(function() {
  window.App.Availability.url = "/borrow/availability";

}).call(this);
(function() {
  window.App.Category.url = (function(_this) {
    return function() {
      return "/borrow/categories";
    };
  })(this);

}).call(this);
(function() {
  window.App.CustomerOrder = {};

}).call(this);
(function() {
  window.App.Group.url = (function(_this) {
    return function() {
      return "/borrow/groups";
    };
  })(this);

}).call(this);
(function() {
  window.App.Holiday.url = (function(_this) {
    return function() {
      return "/borrow/holidays";
    };
  })(this);

}).call(this);
(function() {
  window.App.InventoryPool.url = (function(_this) {
    return function() {
      return "/borrow/inventory_pools";
    };
  })(this);

}).call(this);
(function() {
  window.App.Model.url = (function(_this) {
    return function() {
      return "/borrow/models";
    };
  })(this);

  window.App.Model.hasMany("availabilities", "App.Availability", "model_id");

  window.App.Model.prototype.availableQuantityForInventoryPools = function(inventory_pool_ids) {
    if (!this.plainAvailabilities().all().length) {
      return void 0;
    }
    return _.reduce(this.plainAvailabilities().all(), function(memory, av) {
      if (_.include(inventory_pool_ids, av.inventory_pool_id)) {
        return memory + av.quantity;
      } else {
        return 0;
      }
    }, 0);
  };

}).call(this);
(function() {
  window.App.PlainAvailability.url = (function(_this) {
    return function() {
      return "/borrow/models/availability";
    };
  })(this);

}).call(this);
(function() {
  window.App.Reservation.scope = (function(_this) {
    return function() {
      return "/borrow";
    };
  })(this);

  window.App.Reservation.changeTimeRange = (function(_this) {
    return function(reservations, startDate, endDate, inventoryPool) {
      var i, len, line;
      startDate = moment(startDate).format("YYYY-MM-DD");
      endDate = moment(endDate).format("YYYY-MM-DD");
      for (i = 0, len = reservations.length; i < len; i++) {
        line = reservations[i];
        line.start_date = startDate;
        line.end_date = endDate;
        line.inventory_pool_id = inventoryPool.id;
        App.Reservation.find(line.id).refresh(line);
      }
      return $.post("/borrow/reservations/change_time_range", {
        line_ids: _.map(reservations, function(l) {
          return l.id;
        }),
        start_date: startDate,
        end_date: endDate,
        inventory_pool_id: inventoryPool.id
      });
    };
  })(this);

  window.App.Reservation.prototype.available = function(recover) {
    var availability, maxAvailableForUser, quantity, reservationsToExclude;
    if (recover == null) {
      recover = true;
    }
    quantity = this.subreservations != null ? _.reduce(this.subreservations, (function(mem, l) {
      return mem + l.quantity;
    }), 0) : this.quantity;
    availability = this.model().availabilities().findByAttribute("inventory_pool_id", this.inventory_pool_id);
    if (!availability) {
      return true;
    }
    if (recover) {
      reservationsToExclude = this.subreservations != null ? this.subreservations : [this];
      availability = availability.withoutLines(reservationsToExclude);
    }
    maxAvailableForUser = availability.maxAvailableForGroups(this.start_date, this.end_date, App.User.current.groupIds);
    return maxAvailableForUser >= quantity;
  };

}).call(this);
(function() {
  window.App.Template.hasMany("reservations", "App.TemplateLine", "template_id");

  window.App.Template.prototype.groupedLines = function() {
    var asArray, data, groupedLines, k, reservations, v;
    groupedLines = _.groupBy(App.Template.first().reservations().all(), function(l) {
      var data;
      data = {
        start_date: l.start_date
      };
      if (l.inventory_pool_id != null) {
        data.inventory_pool = App.InventoryPool.find(l.inventory_pool_id).name;
      }
      data.inventory_pool_id = l.inventory_pool_id;
      return JSON.stringify(data);
    });
    asArray = [];
    for (k in groupedLines) {
      v = groupedLines[k];
      reservations = _.map(v, function(l) {
        l.start_date = JSON.parse(k).start_date;
        return l;
      });
      data = {
        start_date: JSON.parse(k).start_date,
        reservations: reservations
      };
      if (JSON.parse(k).inventory_pool_id != null) {
        data.inventory_pool = App.InventoryPool.find(JSON.parse(k).inventory_pool_id);
      }
      asArray.push(data);
    }
    return _.sortBy(asArray, function(e) {
      return e.start_date + " " + (e.inventory_pool != null ? e.inventory_pool.name : '');
    });
  };

}).call(this);

/*
  
  TemplateLine

  a line of a template during the pre order state
 */

(function() {
  var extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateLine = (function(superClass) {
    extend(TemplateLine, superClass);

    function TemplateLine() {
      return TemplateLine.__super__.constructor.apply(this, arguments);
    }

    TemplateLine.configure("TemplateLine", "model_link_id", "template_id", "model_id", "quantity", "start_date", "end_date", "inventory_pool_id", "unborrowable", "available");

    TemplateLine.belongsTo("template", "App.Template", "template_id");

    TemplateLine.belongsTo("model", "App.Model", "model_id");

    return TemplateLine;

  })(Spine.Model);

}).call(this);

/*
  
  TimeoutCountdown
 */

(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  window.App.TimeoutCountdown = (function() {
    function TimeoutCountdown(timeoutMinutes) {
      this.updateTime = bind(this.updateTime, this);
      this.timeoutMinutes = timeoutMinutes;
      this.refreshTime();
    }

    TimeoutCountdown.prototype.refreshTime = function() {
      this.minutes = this.timeoutMinutes;
      this.seconds = 0;
      return this.storeCurrentTimeout();
    };

    TimeoutCountdown.prototype.refresh = function() {
      this.refreshTime();
      $.get("/borrow/refresh_timeout.html");
      return $(this).trigger("timeUpdated");
    };

    TimeoutCountdown.prototype.start = function() {
      this.updateTime();
      return this.interval = setInterval(this.updateTime, 1000);
    };

    TimeoutCountdown.prototype.storeCurrentTimeout = function(date) {
      if (date == null) {
        date = new Date();
      }
      return localStorage.currentTimeout = date;
    };

    TimeoutCountdown.prototype.sync = function() {
      this.currentTimeout = moment(localStorage.currentTimeout);
      this.minutes = this.timeoutMinutes - 1 - Math.floor(Math.floor(moment().diff(this.currentTimeout) / 1000) / 60);
      return this.seconds = 59 - Math.floor(Math.floor(moment().diff(this.currentTimeout) / 1000) % 60);
    };

    TimeoutCountdown.prototype.timeout = function() {
      if (this.timedout == null) {
        return $.get("/borrow/refresh_timeout.json").done((function(_this) {
          return function(data) {
            if (moment().diff(moment(data.date).add(_this.timeoutMinutes, "minutes")) <= 0) {
              return _this.storeCurrentTimeout(moment(data.date).toDate());
            } else {
              _this.timedout = true;
              clearInterval(_this.interval);
              return $(_this).trigger("timeout");
            }
          };
        })(this));
      }
    };

    TimeoutCountdown.prototype.toString = function() {
      var minutesAsString, secondsAsString;
      minutesAsString = String(this.minutes).length === 1 ? "0" + this.minutes : String(this.minutes);
      secondsAsString = String(this.seconds).length === 1 ? "0" + this.seconds : String(this.seconds);
      return minutesAsString + ":" + secondsAsString;
    };

    TimeoutCountdown.prototype.updateTime = function() {
      var remainingSeconds;
      this.sync();
      remainingSeconds = moment(this.currentTimeout).add(this.timeoutMinutes, "minutes").diff(moment(), "seconds");
      if (remainingSeconds <= 0) {
        this.timeout();
      }
      if (this.seconds <= 0 && this.minutes > 0) {
        this.seconds = 59;
        this.minutes = this.minutes - 1;
      } else if (remainingSeconds > 0) {
        this.seconds = this.seconds - 1;
      }
      return $(this).trigger("timeUpdated");
    };

    return TimeoutCountdown;

  })();

}).call(this);
(function() {
  window.App.Workday.url = (function(_this) {
    return function() {
      return "/borrow/workdays";
    };
  })(this);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.BasketController = (function(superClass) {
    extend(BasketController, superClass);

    BasketController.prototype.elements = {
      "#current-order-lines": "reservationsContainer",
      "#order-overview-button": "orderOverviewButton"
    };

    function BasketController() {
      this.render = bind(this.render, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      BasketController.__super__.constructor.apply(this, arguments);
      this.timeoutCountdown = new App.TimeoutCountdownController({
        el: this.el.find("#timeout-countdown"),
        template: "borrow/views/order/basket/timeout_countdown",
        refreshTarget: this.el.find("#timeout-countdown-refresh")
      });
      this.delegateEvents();
    }

    BasketController.prototype.delegateEvents = function() {
      return App.Reservation.on("refresh", this.render);
    };

    BasketController.prototype.render = function() {
      var all_reservations, data, model_id, ref, reservations;
      data = [];
      all_reservations = App.Reservation.all();
      ref = _.groupBy(all_reservations, "model_id");
      for (model_id in ref) {
        reservations = ref[model_id];
        data.push({
          model: App.Model.find(model_id),
          quantity: _.reduce(reservations, ((function(_this) {
            return function(mem, line) {
              return mem + line.quantity;
            };
          })(this)), 0)
        });
      }
      data = _.sortBy(data, function(entry) {
        return entry.model.name();
      });
      this.reservationsContainer.html(App.Render("borrow/views/order/basket/line", data));
      if (_.size(data) > 0) {
        return this.orderOverviewButton.removeClass("hidden");
      } else {
        return this.orderOverviewButton.addClass("hidden");
      }
    };

    return BasketController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.BorrowBookingCalendarDialogController = (function(superClass) {
    extend(BorrowBookingCalendarDialogController, superClass);

    function BorrowBookingCalendarDialogController(options) {
      this.submit = bind(this.submit, this);
      this.valid = bind(this.valid, this);
      this.setupBookingCalendar = bind(this.setupBookingCalendar, this);
      this.renderInventoryPools = bind(this.renderInventoryPools, this);
      this.selectFirstInventoryPool = bind(this.selectFirstInventoryPool, this);
      this.initalizeDialog = bind(this.initalizeDialog, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchData = bind(this.fetchData, this);
      this.setupModal = bind(this.setupModal, this);
      this.availabilities = {};
      BorrowBookingCalendarDialogController.__super__.constructor.apply(this, arguments);
    }

    BorrowBookingCalendarDialogController.prototype.setupModal = function() {
      this.dialog = $(App.Render("borrow/views/booking_calendar/calendar_dialog", {
        model: App.Model.find(this.modelId),
        titel: this.titel,
        buttonText: this.buttonText
      }));
      return BorrowBookingCalendarDialogController.__super__.setupModal.apply(this, arguments);
    };

    BorrowBookingCalendarDialogController.prototype.fetchData = function() {
      return App.InventoryPool.ajaxFetch().done((function(_this) {
        return function() {
          var i, ip, len, ref, results;
          _this.fetchWorkdays().done(function() {
            return _this.initalizeDialog();
          });
          _this.fetchHolidays().done(function() {
            return _this.initalizeDialog();
          });
          _this.fetchGroups().done(function() {
            return _this.initalizeDialog();
          });
          ref = App.InventoryPool.all();
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            ip = ref[i];
            results.push(_this.fetchAvailability(ip.id).done(function() {
              return _this.initalizeDialog();
            }));
          }
          return results;
        };
      })(this));
    };

    BorrowBookingCalendarDialogController.prototype.fetchAvailability = function(inventoryPoolId) {
      return App.Availability.ajaxFetch({
        data: $.param({
          model_id: this.modelId,
          inventory_pool_id: inventoryPoolId
        })
      }).done((function(_this) {
        return function(availability) {
          return _this.availabilities[availability.inventory_pool_id] = App.Availability.find(availability.id);
        };
      })(this));
    };

    BorrowBookingCalendarDialogController.prototype.initalizeDialog = function() {
      if (!(this.workdays && this.holidays && this.groups && _.size(this.availabilities) === App.InventoryPool.all().length)) {
        return false;
      }
      this.renderInventoryPools();
      this.selectFirstInventoryPool();
      return BorrowBookingCalendarDialogController.__super__.initalizeDialog.apply(this, arguments);
    };

    BorrowBookingCalendarDialogController.prototype.selectFirstInventoryPool = function() {};

    BorrowBookingCalendarDialogController.prototype.renderInventoryPools = function() {
      var av, i, inventoryPool, len, option, ref, results;
      this.inventoryPoolSelect.html("");
      ref = _.sortBy(App.InventoryPool.all(), function(ip) {
        return ip.name;
      });
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        inventoryPool = ref[i];
        av = this.getAvailability(inventoryPool);
        if (av.total_borrowable > 0) {
          option = $(App.Render("borrow/views/booking_calendar/inventory_pool_option", inventoryPool, {
            availability: av
          }));
          option.data("availability", av);
          option.data("holidays", inventoryPool.holidays().all());
          option.data("closed_days", inventoryPool.workday().closedDays());
          results.push(this.inventoryPoolSelect.append(option));
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    BorrowBookingCalendarDialogController.prototype.setupBookingCalendar = function() {
      return new App.BorrowBookingCalendar({
        calendarEl: this.dialog.find("#booking-calendar"),
        startDateEl: this.startDateEl,
        endDateEl: this.endDateEl,
        quantityEl: this.dialog.find("#booking-calendar-quantity"),
        ipSelectorEl: this.dialog.find("#booking-calendar-inventory-pool"),
        quantityMode: "numbers",
        groupIds: _.map(App.Group.all(), function(g) {
          return g.id;
        })
      });
    };

    BorrowBookingCalendarDialogController.prototype.valid = function() {
      var av, ip;
      ip = this.getSelectedInventoryPool();
      av = this.availabilities[ip.id];
      if (this.withoutLines) {
        av = av.withoutLines(this.reservations);
      }
      this.errors = [];
      if (av.maxAvailableForGroups(this.getStartDate(), this.getEndDate(), _.map(this.groups, function(g) {
        return g.id;
      })) < this.getQuantity()) {
        this.errors.push(_jed("Item is not available in that time range"));
      }
      if (!ip.hasEnoughReservationAdvanceDays(this.getStartDate())) {
        this.errors.push(_jed("No orders are possible on this start date"));
      } else {
        if (!ip.isVisitPossible(this.getStartDate())) {
          this.errors.push(_jed("Booking is no longer possible on this start date"));
        }
        if (!ip.isVisitPossible(this.getEndDate())) {
          this.errors.push(_jed("Booking is no longer possible on this end date"));
        }
      }
      if (ip.isClosedOn(this.getStartDate())) {
        this.errors.push(_jed("Inventory pool is closed on start date"));
      }
      if (ip.isClosedOn(this.getEndDate())) {
        this.errors.push(_jed("Inventory pool is closed on end date"));
      }
      return !this.errors.length;
    };

    BorrowBookingCalendarDialogController.prototype.submit = function() {
      this.validationAlerts();
      return BorrowBookingCalendarDialogController.__super__.submit.apply(this, arguments);
    };

    return BorrowBookingCalendarDialogController;

  })(App.BookingCalendarDialogController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexController = (function(superClass) {
    extend(ModelsIndexController, superClass);

    ModelsIndexController.prototype.elements = {
      "#model-list": "list"
    };

    ModelsIndexController.prototype.events = {
      "click [data-create-order-line]": "createReservation"
    };

    function ModelsIndexController() {
      this.extendParamsWithSearchTerm = bind(this.extendParamsWithSearchTerm, this);
      this.loading = bind(this.loading, this);
      this.render = bind(this.render, this);
      this.fetchAvailability = bind(this.fetchAvailability, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.resetAllFilter = bind(this.resetAllFilter, this);
      this.isResetable = bind(this.isResetable, this);
      this.resetAndFetchModels = bind(this.resetAndFetchModels, this);
      this.periodChange = bind(this.periodChange, this);
      this.createReservation = bind(this.createReservation, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      ModelsIndexController.__super__.constructor.apply(this, arguments);
      this.models = _.map(this.models, (function(_this) {
        return function(m) {
          return new App.Model(m);
        };
      })(this));
      this.searchTerm = this.params.search_term;
      this.reset = new App.ModelsIndexResetController({
        el: this.el.find("#reset-all-filter"),
        reset: this.resetAllFilter,
        isResetable: this.isResetable
      });
      this.ipSelector = new App.ModelsIndexIpSelectorController({
        el: this.el.find("#ip-selector"),
        onChange: (function(_this) {
          return function() {
            return _this.resetAndFetchModels();
          };
        })(this)
      });
      this.sorting = new App.ModelsIndexSortingController({
        el: this.el.find("#model-sorting"),
        onChange: (function(_this) {
          return function() {
            return _this.resetAndFetchModels();
          };
        })(this)
      });
      this.search = new App.ModelsIndexSearchController({
        el: this.el.find("#model-list-search"),
        onChange: (function(_this) {
          return function() {
            return _this.resetAndFetchModels();
          };
        })(this)
      });
      this.period = new App.ModelsIndexPeriodController({
        el: this.el.find("#period"),
        onChange: (function(_this) {
          return function() {
            return _this.periodChange();
          };
        })(this)
      });
      this.pagination = new App.ModelsIndexPaginationController({
        el: this.list,
        onChange: (function(_this) {
          return function(page) {
            return _this.fetchModels(page);
          };
        })(this)
      });
      this.tooltips = new App.ModelsIndexTooltipController({
        el: this.list
      });
      this.delegateEvents();
      this.sessionStorage = new App.SessionStorageController({
        el: this.el,
        ipSelector: this.ipSelector,
        sorting: this.sorting,
        search: this.search,
        period: this.period
      });
      if (!this.sessionStorage.isEmpty()) {
        this.sessionStorage.restoreFilters({
          callback: this.resetAndFetchModels
        });
      }
    }

    ModelsIndexController.prototype.delegateEvents = function() {
      ModelsIndexController.__super__.delegateEvents.apply(this, arguments);
      App.PlainAvailability.on("refresh", this.render);
      return App.Model.on("ajaxSuccess", (function(_this) {
        return function(e, status, xhr) {
          return _this.pagination.setData(JSON.parse(xhr.getResponseHeader("X-Pagination")));
        };
      })(this));
    };

    ModelsIndexController.prototype.createReservation = function(e) {
      e.preventDefault();
      new App.ReservationsCreateController({
        modelId: $(e.currentTarget).data("model-id"),
        titel: _jed("Add to order"),
        buttonText: _jed("Add")
      });
      return false;
    };

    ModelsIndexController.prototype.periodChange = function() {
      this.reset.validate();
      this.tooltips.tooltips = {};
      if (this.period.getPeriod() != null) {
        this.sessionStorage.update();
        this.loading();
        return this.fetchAvailability();
      } else {
        App.PlainAvailability.deleteAll();
        return this.render();
      }
    };

    ModelsIndexController.prototype.resetAndFetchModels = function(arg) {
      var clearSessionStorage;
      clearSessionStorage = (arg != null ? arg : {
        clearSessionStorage: false
      }).clearSessionStorage;
      this.reset.validate();
      this.loading();
      if (clearSessionStorage) {
        this.sessionStorage.clear();
      } else {
        this.sessionStorage.update();
      }
      this.models = [];
      this.pagination.page = 1;
      this.tooltips.tooltips = {};
      return this.fetchModels();
    };

    ModelsIndexController.prototype.isResetable = function() {
      return this.search.is_resetable() || this.sorting.is_resetable() || this.period.is_resetable() || this.ipSelector.is_resetable();
    };

    ModelsIndexController.prototype.resetAllFilter = function() {
      this.ipSelector.reset();
      this.sorting.reset();
      this.search.reset();
      this.period.reset();
      return this.resetAndFetchModels({
        clearSessionStorage: true
      });
    };

    ModelsIndexController.prototype.fetchModels = function(page) {
      var params;
      $.extend(this.params, {
        inventory_pool_ids: this.ipSelector.activeInventoryPoolIds()
      });
      $.extend(this.params, this.sorting.getCurrentSorting());
      this.extendParamsWithSearchTerm();
      params = _.clone(this.params);
      if (page != null) {
        params.page = page;
      }
      return App.Model.ajaxFetch({
        data: $.param(params)
      }).done((function(_this) {
        return function(data) {
          var datum;
          _this.models = _this.models.concat((function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })());
          if (_this.period.getPeriod() != null) {
            return _this.fetchAvailability();
          } else {
            return _this.render();
          }
        };
      })(this));
    };

    ModelsIndexController.prototype.fetchAvailability = function() {
      var model_ids;
      model_ids = _.map(this.models, (function(_this) {
        return function(m) {
          return m.id;
        };
      })(this));
      this.currentStartDate = this.period.getPeriod().start_date;
      this.currentEndDate = this.period.getPeriod().end_date;
      return App.PlainAvailability.fetch({
        data: $.param({
          start_date: this.period.getPeriod().start_date,
          end_date: this.period.getPeriod().end_date,
          model_ids: model_ids,
          inventory_pool_ids: this.ipSelector.activeInventoryPoolIds()
        })
      });
    };

    ModelsIndexController.prototype.render = function() {
      this.list.html(App.Render("borrow/views/models/index/line", this.models, {
        inventory_pool_ids: this.ipSelector.activeInventoryPoolIds()
      }));
      return this.pagination.render();
    };

    ModelsIndexController.prototype.loading = function() {
      return this.list.html(App.Render("borrow/views/models/index/loading"));
    };

    ModelsIndexController.prototype.extendParamsWithSearchTerm = function() {
      if (this.searchTerm != null) {
        if (this.search.getInputText().search_term != null) {
          return this.params.search_term = this.searchTerm + " " + (this.search.getInputText().search_term);
        } else {
          return this.params.search_term = this.searchTerm;
        }
      } else {
        return $.extend(this.params, this.search.getInputText());
      }
    };

    return ModelsIndexController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexIpSelectorController = (function(superClass) {
    extend(ModelsIndexIpSelectorController, superClass);

    ModelsIndexIpSelectorController.activeInventoryPoolIds = [];

    ModelsIndexIpSelectorController.prototype.events = {
      "change input[type='checkbox']": "changeInventoryPools",
      "click .dropdown-item": "selectInventoryPool"
    };

    ModelsIndexIpSelectorController.prototype.elements = {
      ".button": "button"
    };

    function ModelsIndexIpSelectorController() {
      this.is_resetable = bind(this.is_resetable, this);
      this.reset = bind(this.reset, this);
      this.render = bind(this.render, this);
      this.activeInventoryPoolIds = bind(this.activeInventoryPoolIds, this);
      this.change = bind(this.change, this);
      this.changeInventoryPools = bind(this.changeInventoryPools, this);
      this.selectMultipleInventoryPools = bind(this.selectMultipleInventoryPools, this);
      this.selectInventoryPool = bind(this.selectInventoryPool, this);
      ModelsIndexIpSelectorController.__super__.constructor.apply(this, arguments);
      App.ModelsIndexIpSelectorController.activeInventoryPoolIds = _.map(this.el.find("input:checked"), function(i) {
        return $(i).closest("[data-id]").data().id;
      });
    }

    ModelsIndexIpSelectorController.prototype.selectInventoryPool = function(e) {
      var target;
      target = $(e.target);
      if (target.data("all") != null) {
        this.el.find("input:checkbox").prop("checked", true);
        return this.changeInventoryPools();
      } else if (target.hasClass("dropdown-item")) {
        this.el.find("input:checkbox").prop("checked", false);
        return target.find("input:checkbox").prop("checked", true).change();
      }
    };

    ModelsIndexIpSelectorController.prototype.selectMultipleInventoryPools = function(ipIds) {
      return _.each(this.el.find("a[data-id]"), function(ipLink) {
        var isChecked;
        isChecked = _.contains(ipIds, $(ipLink).data("id"));
        return $(ipLink).find("input:checkbox").prop("checked", isChecked);
      });
    };

    ModelsIndexIpSelectorController.prototype.changeInventoryPools = function(e) {
      if (!this.el.find("input:checkbox:checked").length) {
        return $(e.currentTarget).prop("checked", true);
      } else {
        return this.change();
      }
    };

    ModelsIndexIpSelectorController.prototype.change = function() {
      App.ModelsIndexIpSelectorController.activeInventoryPoolIds = this.activeInventoryPoolIds();
      this.render();
      return this.onChange();
    };

    ModelsIndexIpSelectorController.prototype.activeInventoryPoolIds = function() {
      return _.map(this.el.find("input:checked"), function(i) {
        return $(i).closest("[data-id]").data("id");
      });
    };

    ModelsIndexIpSelectorController.prototype.render = function() {
      var activeInventoryPools, length, text, total_count;
      activeInventoryPools = _.map(this.el.find("input:checked"), function(i) {
        return $(i).closest("[data-id]").data();
      });
      total_count = this.el.find("input").length;
      length = activeInventoryPools.length;
      text = (function() {
        switch (length) {
          case 1:
            return _.first(activeInventoryPools).name;
          case total_count:
            return _jed("All inventory pools");
          default:
            return length + " " + (_jed(length, "Inventory pool", "Inventory pools"));
        }
      })();
      return this.button.html(App.Render("borrow/views/models/index/ip_selector", {
        text: text
      }));
    };

    ModelsIndexIpSelectorController.prototype.reset = function() {
      this.el.find("input:checkbox").prop("checked", true);
      return this.render();
    };

    ModelsIndexIpSelectorController.prototype.is_resetable = function() {
      return this.activeInventoryPoolIds().length !== this.el.find("[data-id]").length;
    };

    return ModelsIndexIpSelectorController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexPaginationController = (function(superClass) {
    extend(ModelsIndexPaginationController, superClass);

    ModelsIndexPaginationController.prototype.events = {
      "inview .page:not(.fetched)": "pageInview"
    };

    function ModelsIndexPaginationController() {
      this.pageInview = bind(this.pageInview, this);
      this.render = bind(this.render, this);
      this.totalPages = bind(this.totalPages, this);
      this.setData = bind(this.setData, this);
      ModelsIndexPaginationController.__super__.constructor.apply(this, arguments);
      this.setData(this.el.data("pagination"));
      this.page = this.el.data("pagination").page;
      this.render();
    }

    ModelsIndexPaginationController.prototype.setData = function(data) {
      this.totalCount = data.total_count;
      return this.perPage = data.per_page;
    };

    ModelsIndexPaginationController.prototype.totalPages = function() {
      return Math.ceil(this.totalCount / this.perPage);
    };

    ModelsIndexPaginationController.prototype.render = function() {
      var notLoadedPages;
      notLoadedPages = this.totalPages() - this.page;
      if (notLoadedPages > 0) {
        return _.each(_.range(1, notLoadedPages + 1), (function(_this) {
          return function(page) {
            var template;
            page = page + _this.page;
            template = $(App.Render("borrow/views/models/index/page", page, {
              entries: _.range(_this.perPage),
              page: page
            }));
            return _this.el.append(template);
          };
        })(this));
      }
    };

    ModelsIndexPaginationController.prototype.pageInview = function(e) {
      var pageEl;
      pageEl = $(e.currentTarget);
      pageEl.addClass("fetched");
      this.page = pageEl.data("page");
      return this.onChange(this.page);
    };

    return ModelsIndexPaginationController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexPeriodController = (function(superClass) {
    extend(ModelsIndexPeriodController, superClass);

    ModelsIndexPeriodController.prototype.elements = {
      "#start-date": "startDate",
      "#end-date": "endDate"
    };

    ModelsIndexPeriodController.prototype.events = {
      "keydown #start-date": "validate",
      "keydown #end-date": "validate",
      "mousedown #start-date": "validate",
      "mousedown #end-date": "validate",
      "change #start-date": "validate",
      "change #end-date": "validate",
      "preChange #start-date": "selectStartDate",
      "preChange #end-date": "selectEndDate"
    };

    function ModelsIndexPeriodController() {
      this.is_resetable = bind(this.is_resetable, this);
      this.reset = bind(this.reset, this);
      this.validate = bind(this.validate, this);
      this.getPeriod = bind(this.getPeriod, this);
      this.selectEndDate = bind(this.selectEndDate, this);
      this.setupEndDate = bind(this.setupEndDate, this);
      this.selectStartDate = bind(this.selectStartDate, this);
      ModelsIndexPeriodController.__super__.constructor.apply(this, arguments);
      this.setupStartDate();
      this.setupEndDate();
    }

    ModelsIndexPeriodController.prototype.setStartDate = function(date) {
      return this.setDateFor(this.startDate, date);
    };

    ModelsIndexPeriodController.prototype.setEndDate = function(date) {
      return this.setDateFor(this.endDate, date);
    };

    ModelsIndexPeriodController.prototype.setDateFor = function(dpElement, date) {
      return dpElement.datepicker("setDate", date);
    };

    ModelsIndexPeriodController.prototype.setupStartDate = function() {
      this.startDate.datepicker({
        onSelect: this.selectStartDate,
        minDate: moment().toDate()
      });
      return this.startDate.preChange();
    };

    ModelsIndexPeriodController.prototype.selectStartDate = function() {
      var date;
      date = moment(this.startDate.val(), i18n.date.L);
      if (!moment(date).isValid()) {
        return false;
      }
      if ((this.endDate.val() == null) || !this.endDate.val().length || date.diff(moment(this.endDate.val(), i18n.date.L), "days") >= 0) {
        this.endDate.val(date.add(1, "days").format(i18n.date.L));
      }
      this.endDate.datepicker("option", "minDate", moment(date, i18n.date.L).toDate());
      this.startDate.trigger("change");
      return this.onChange();
    };

    ModelsIndexPeriodController.prototype.setupEndDate = function() {
      this.endDate.datepicker({
        onSelect: this.selectEndDate,
        minDate: moment().toDate()
      });
      return this.endDate.preChange();
    };

    ModelsIndexPeriodController.prototype.selectEndDate = function() {
      var date;
      date = moment(this.endDate.val(), i18n.date.L);
      if (!moment(date).isValid()) {
        return false;
      }
      if ((this.startDate.val() == null) || !this.startDate.val().length) {
        this.startDate.val(date.subtract(1, "days").format(i18n.date.L));
      }
      this.endDate.trigger("change");
      return this.onChange();
    };

    ModelsIndexPeriodController.prototype.getPeriod = function() {
      if (this.startDate.val().length && this.endDate.val().length) {
        return {
          start_date: moment(this.startDate.val(), i18n.date.L).format("YYYY-MM-DD"),
          end_date: moment(this.endDate.val(), i18n.date.L).format("YYYY-MM-DD")
        };
      }
    };

    ModelsIndexPeriodController.prototype.validate = function() {
      if (this.startDate.val().length === 0 || this.endDate.val().length === 0) {
        return this.onChange();
      }
    };

    ModelsIndexPeriodController.prototype.reset = function() {
      this.startDate.val(null);
      this.endDate.val(null);
      return App.PlainAvailability.deleteAll();
    };

    ModelsIndexPeriodController.prototype.is_resetable = function() {
      return this.getPeriod() != null;
    };

    return ModelsIndexPeriodController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexResetController = (function(superClass) {
    extend(ModelsIndexResetController, superClass);

    ModelsIndexResetController.prototype.events = {
      "click": "resetAllFilter"
    };

    function ModelsIndexResetController() {
      this.showResetIcon = bind(this.showResetIcon, this);
      this.hideResetIcon = bind(this.hideResetIcon, this);
      this.validate = bind(this.validate, this);
      this.resetAllFilter = bind(this.resetAllFilter, this);
      ModelsIndexResetController.__super__.constructor.apply(this, arguments);
      this.resetContainer = $("#reset-container");
    }

    ModelsIndexResetController.prototype.resetAllFilter = function() {
      this.reset();
      return this.hideResetIcon();
    };

    ModelsIndexResetController.prototype.validate = function() {
      if (this.isResetable()) {
        return this.showResetIcon();
      } else {
        return this.hideResetIcon();
      }
    };

    ModelsIndexResetController.prototype.hideResetIcon = function() {
      this.el.addClass("hidden");
      return this.resetContainer.removeClass("padding-left-m");
    };

    ModelsIndexResetController.prototype.showResetIcon = function() {
      this.el.removeClass("hidden");
      return this.resetContainer.addClass("padding-left-m");
    };

    return ModelsIndexResetController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexSearchController = (function(superClass) {
    extend(ModelsIndexSearchController, superClass);

    ModelsIndexSearchController.prototype.events = {
      "preChange input": "onChange"
    };

    ModelsIndexSearchController.prototype.elements = {
      "input": "inputField"
    };

    function ModelsIndexSearchController() {
      this.is_resetable = bind(this.is_resetable, this);
      this.reset = bind(this.reset, this);
      ModelsIndexSearchController.__super__.constructor.apply(this, arguments);
      this.inputField.preChange();
    }

    ModelsIndexSearchController.prototype.getInputText = function() {
      if (this.inputField.val().length) {
        return {
          search_term: this.inputField.val()
        };
      } else {
        return {
          search_term: null
        };
      }
    };

    ModelsIndexSearchController.prototype.reset = function() {
      return this.inputField.val("");
    };

    ModelsIndexSearchController.prototype.is_resetable = function() {
      return (this.getInputText().search_term != null) && this.getInputText().search_term.length > 0;
    };

    return ModelsIndexSearchController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexSortingController = (function(superClass) {
    extend(ModelsIndexSortingController, superClass);

    function ModelsIndexSortingController() {
      this.is_resetable = bind(this.is_resetable, this);
      this.reset = bind(this.reset, this);
      this.getCurrentSorting = bind(this.getCurrentSorting, this);
      this.render = bind(this.render, this);
      this.change = bind(this.change, this);
      return ModelsIndexSortingController.__super__.constructor.apply(this, arguments);
    }

    ModelsIndexSortingController.prototype.events = {
      "click a[data-sort]": "change"
    };

    ModelsIndexSortingController.prototype.elements = {
      ".button": "button"
    };

    ModelsIndexSortingController.prototype.change = function(e) {
      var dropdown, target;
      target = $(e.currentTarget);
      dropdown = target.closest(".dropdown");
      dropdown.addClass("hidden");
      _.delay(((function(_this) {
        return function() {
          return dropdown.removeClass("hidden");
        };
      })(this)), 200);
      this.sort = target.data("sort");
      this.order = target.data("order");
      this.render();
      return this.onChange();
    };

    ModelsIndexSortingController.prototype.render = function(e) {
      return this.button.html(App.Render("borrow/views/models/index/sorting", {
        sort: this.sort,
        order: this.order
      }));
    };

    ModelsIndexSortingController.prototype.getCurrentSorting = function() {
      return {
        sort: this.sort,
        order: this.order
      };
    };

    ModelsIndexSortingController.prototype.reset = function() {
      this.sort = "name";
      this.order = "asc";
      return this.render();
    };

    ModelsIndexSortingController.prototype.is_resetable = function() {
      return ((this.getCurrentSorting().sort != null) && this.getCurrentSorting().sort !== "name") || ((this.getCurrentSorting().order != null) && this.getCurrentSorting().order !== "asc");
    };

    return ModelsIndexSortingController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsIndexTooltipController = (function(superClass) {
    extend(ModelsIndexTooltipController, superClass);

    function ModelsIndexTooltipController() {
      this.leaveLine = bind(this.leaveLine, this);
      this.stayOnLine = bind(this.stayOnLine, this);
      this.enterLine = bind(this.enterLine, this);
      this.fetchProperties = bind(this.fetchProperties, this);
      this.createTooltip = bind(this.createTooltip, this);
      return ModelsIndexTooltipController.__super__.constructor.apply(this, arguments);
    }

    ModelsIndexTooltipController.prototype.events = {
      "mouseleave .line[data-id]": "leaveLine",
      "mouseenter .line[data-id]": "enterLine"
    };

    ModelsIndexTooltipController.prototype.tooltips = {};

    ModelsIndexTooltipController.prototype.createTooltip = function(line) {
      return new App.Tooltip({
        el: line,
        trackTooltip: true,
        delay: [200, 100],
        trigger: 'hover'
      });
    };

    ModelsIndexTooltipController.prototype.fetchProperties = function(model_id, target) {
      return App.Property.ajaxFetch({
        data: $.param({
          model_ids: [model_id]
        })
      }).done((function(_this) {
        return function() {
          var content, model, tooltip;
          if (!App.Model.exists(model_id)) {
            return false;
          }
          if ((_this.tooltips[model_id] != null) && target.hasClass('tooltipstered')) {
            return false;
          }
          tooltip = _this.createTooltip(target);
          _this.tooltips[model_id] = tooltip;
          _this.currentTooltip = tooltip;
          if (tooltip != null) {
            model = App.Model.find(model_id);
            model.propertiesToDisplay = _.first(model.properties().all(), 5);
            model.amount_of_images = 1;
            content = App.Render("borrow/views/models/index/tooltip", model);
            tooltip.update(content);
            return setTimeout(function() {
              if (_this.currentTooltip === tooltip && _this.mouseOverTooltip) {
                return tooltip.show();
              }
            }, 0);
          }
        };
      })(this));
    };

    ModelsIndexTooltipController.prototype.enterLine = function(e) {
      this.mouseOverTooltip = true;
      this.currentTargetId = $(e.currentTarget).data("id");
      return _.delay(((function(_this) {
        return function() {
          return _this.stayOnLine(e);
        };
      })(this)), 200);
    };

    ModelsIndexTooltipController.prototype.stayOnLine = function(e) {
      var model_id, target, tooltip;
      if (this.currentTargetId !== $(e.currentTarget).data("id") || !this.mouseOverTooltip) {
        return false;
      }
      $("*:focus").blur().datepicker("hide");
      target = $(e.currentTarget);
      model_id = target.data('id');
      if (App.Model.exists(model_id)) {
        if (!((this.tooltips[model_id] != null) && target.hasClass('tooltipstered'))) {
          return this.fetchProperties(model_id, target);
        } else {
          tooltip = this.tooltips[model_id];
          return this.currentTooltip = tooltip;
        }
      }
    };

    ModelsIndexTooltipController.prototype.leaveLine = function(e) {
      return this.mouseOverTooltip = false;
    };

    return ModelsIndexTooltipController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsShowController = (function(superClass) {
    extend(ModelsShowController, superClass);

    ModelsShowController.prototype.events = {
      "click [data-create-order-line]": "createReservation"
    };

    function ModelsShowController() {
      this.createReservation = bind(this.createReservation, this);
      ModelsShowController.__super__.constructor.apply(this, arguments);
      new App.ModelsShowPropertiesController({
        el: "#properties"
      });
      new App.ModelsShowImagesController({
        el: "#images"
      });
    }

    ModelsShowController.prototype.createReservation = function(e) {
      e.preventDefault();
      new App.ReservationsCreateController({
        modelId: $(e.currentTarget).data("model-id"),
        titel: _jed("Add to order"),
        buttonText: _jed("Add")
      });
      return false;
    };

    return ModelsShowController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsShowImagesController = (function(superClass) {
    extend(ModelsShowImagesController, superClass);

    ModelsShowImagesController.prototype.elements = {
      "#main-image": "mainImage"
    };

    ModelsShowImagesController.prototype.events = {
      "mouseenter [data-image-url]:not(#main-image)": "enterImage",
      "mouseleave [data-image-url]:not(#main-image)": "leaveImage",
      "click [data-image-url]:not(#main-image)": "clickImage"
    };

    function ModelsShowImagesController() {
      this.releaseCurrentImage = bind(this.releaseCurrentImage, this);
      this.lockImage = bind(this.lockImage, this);
      this.clickImage = bind(this.clickImage, this);
      this.leaveImage = bind(this.leaveImage, this);
      this.enterImage = bind(this.enterImage, this);
      ModelsShowImagesController.__super__.constructor.apply(this, arguments);
      this.lockImage(this.el.find("[data-image-url]:not(#main-image):first"));
    }

    ModelsShowImagesController.prototype.enterImage = function(e) {
      var target;
      this.mouseover = true;
      target = $(e.currentTarget);
      return this.mainImage.attr("src", target.data("image-url"));
    };

    ModelsShowImagesController.prototype.leaveImage = function(e) {
      this.mouseover = false;
      return _.delay((function(_this) {
        return function() {
          if (_this.mouseover === false) {
            if (_this.currentImage != null) {
              return _this.mainImage.attr("src", _this.currentImage.data("image-url"));
            } else {
              return _this.mainImage.attr("src", _this.mainImage.data("image-url"));
            }
          }
        };
      })(this), 100);
    };

    ModelsShowImagesController.prototype.clickImage = function(e) {
      return this.lockImage($(e.currentTarget));
    };

    ModelsShowImagesController.prototype.lockImage = function(target) {
      this.releaseCurrentImage();
      target.addClass("focus-thin");
      return this.currentImage = target;
    };

    ModelsShowImagesController.prototype.releaseCurrentImage = function() {
      if (this.currentImage == null) {
        return false;
      }
      return this.currentImage.removeClass("focus-thin");
    };

    return ModelsShowImagesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ModelsShowPropertiesController = (function(superClass) {
    extend(ModelsShowPropertiesController, superClass);

    ModelsShowPropertiesController.prototype.elements = {
      ".property": "properties"
    };

    ModelsShowPropertiesController.prototype.events = {
      "click #properties-toggle": "toggle"
    };

    function ModelsShowPropertiesController() {
      this.hide = bind(this.hide, this);
      this.show = bind(this.show, this);
      this.toggle = bind(this.toggle, this);
      this.setupShowMore = bind(this.setupShowMore, this);
      ModelsShowPropertiesController.__super__.constructor.apply(this, arguments);
      this.open = false;
      this.setupShowMore();
    }

    ModelsShowPropertiesController.prototype.setupShowMore = function() {
      var container;
      if (this.properties.length > 5) {
        container = $(App.Render("borrow/views/models/show/collapsed_properties"));
        this.collapsedProperties = container.find("#collapsed-properties");
        this.showAllText = container.find("#show-all-properties-text");
        this.showLessText = container.find("#show-less-properties-text");
        this.toggleEl = container.find("#properties-toggle");
        container.find(".collapsed-inner").html(this.properties.slice(5, this.properties.length));
        return this.el.append(container);
      }
    };

    ModelsShowPropertiesController.prototype.toggle = function() {
      if (this.open) {
        this.open = false;
        return this.hide();
      } else {
        this.open = true;
        return this.show();
      }
    };

    ModelsShowPropertiesController.prototype.show = function() {
      this.collapsedProperties.removeClass("collapsed");
      this.showAllText.addClass("hidden");
      this.showLessText.removeClass("hidden");
      return this.collapsedProperties.addClass("separated-bottom");
    };

    ModelsShowPropertiesController.prototype.hide = function() {
      this.collapsedProperties.addClass("collapsed");
      this.showAllText.removeClass("hidden");
      this.showLessText.addClass("hidden");
      return this.collapsedProperties.removeClass("separated-bottom");
    };

    return ModelsShowPropertiesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SessionStorageController = (function(superClass) {
    extend(SessionStorageController, superClass);

    function SessionStorageController() {
      this.getLocalizedDateFormat = bind(this.getLocalizedDateFormat, this);
      this.formatDate = bind(this.formatDate, this);
      this.update = bind(this.update, this);
      this.clear = bind(this.clear, this);
      this.restoreFilters = bind(this.restoreFilters, this);
      this.isEmpty = bind(this.isEmpty, this);
      SessionStorageController.__super__.constructor.apply(this, arguments);
      new App.SessionStorageUrlController({
        el: this.el.find("#breadcrumbs")
      });
      new App.SessionStorageUrlController({
        el: this.el.find("#explorative-search")
      });
    }

    SessionStorageController.prototype.isEmpty = function() {
      return sessionStorage.length === 0;
    };

    SessionStorageController.prototype.restoreFilters = function(arg) {
      var callback, ipIds, sorting;
      callback = arg.callback;
      if (sessionStorage.searchTerm) {
        this.search.inputField.val(sessionStorage.searchTerm);
      }
      if (sessionStorage.inventoryPoolIds) {
        ipIds = JSON.parse(sessionStorage.inventoryPoolIds);
        if (ipIds.length > 0) {
          this.ipSelector.selectMultipleInventoryPools(ipIds);
          App.ModelsIndexIpSelectorController.activeInventoryPoolIds = ipIds;
          this.ipSelector.render();
        }
      }
      if (sessionStorage.sorting) {
        sorting = JSON.parse(sessionStorage.sorting);
        if (!_.isEmpty(sorting)) {
          this.sorting.sort = sorting.sort;
          this.sorting.order = sorting.order;
          this.sorting.render();
        }
      }
      if (sessionStorage.startDate) {
        this.period.setStartDate(this.getLocalizedDateFormat(sessionStorage.startDate));
      }
      if (sessionStorage.endDate) {
        this.period.setEndDate(this.getLocalizedDateFormat(sessionStorage.endDate));
      }
      return callback();
    };

    SessionStorageController.prototype.clear = function() {
      sessionStorage.clear();
      return App.SessionStorageUrlController.removeSessionStorageFromUrl();
    };

    SessionStorageController.prototype.update = function() {
      sessionStorage.setItem("inventoryPoolIds", JSON.stringify(this.ipSelector.activeInventoryPoolIds()));
      sessionStorage.setItem("sorting", JSON.stringify(this.sorting.getCurrentSorting()));
      sessionStorage.setItem("searchTerm", this.search.inputField.val());
      if (!_.isEmpty(this.period.startDate.val())) {
        sessionStorage.setItem("startDate", this.formatDate(this.period.startDate.val()));
      }
      if (!_.isEmpty(this.period.endDate.val())) {
        sessionStorage.setItem("endDate", this.formatDate(this.period.endDate.val()));
      }
      if (!this.isEmpty()) {
        return App.SessionStorageUrlController.addSessionStorageToUrl();
      }
    };

    SessionStorageController.prototype.formatDate = function(date) {
      if (!_.isEmpty(date)) {
        return moment(date, i18n.date.L).format("DD.MM.YYYY");
      } else {
        return date;
      }
    };

    SessionStorageController.prototype.getLocalizedDateFormat = function(date) {
      return moment(date, "DD.MM.YYYY").format(i18n.date.L);
    };

    return SessionStorageController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SessionStorageUrlController = (function(superClass) {
    extend(SessionStorageUrlController, superClass);

    function SessionStorageUrlController() {
      this.getHref = bind(this.getHref, this);
      this.setSessionStorageParam = bind(this.setSessionStorageParam, this);
      return SessionStorageUrlController.__super__.constructor.apply(this, arguments);
    }

    SessionStorageUrlController.prototype.events = {
      "click": "setSessionStorageParam"
    };

    SessionStorageUrlController.prototype.setSessionStorageParam = function(e) {
      var href;
      if (e.target.id === "start") {
        return;
      }
      if (sessionStorage.length > 0) {
        e.preventDefault();
        href = this.getHref($(e.target));
        if (!(href && href.length)) {
          return;
        }
        return window.location = href + "&session_storage=true";
      }
    };

    SessionStorageUrlController.prototype.getHref = function(el) {
      if (el.tagName !== "A") {
        return $(el).closest("[href]").attr("href");
      } else {
        return $(el).attr("href");
      }
    };

    SessionStorageUrlController.addSessionStorageToUrl = function() {
      var href;
      if (!_.string.contains(window.location.href, "&session_storage=true")) {
        href = String(window.location.href) + "&session_storage=true";
        return history.replaceState(null, document.title, href);
      }
    };

    SessionStorageUrlController.removeSessionStorageFromUrl = function() {
      var href;
      href = String(window.location.href).replace("&session_storage=true", "");
      return history.replaceState(null, document.title, href);
    };

    return SessionStorageUrlController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsChangeController = (function(superClass) {
    extend(ReservationsChangeController, superClass);

    function ReservationsChangeController() {
      this.changeRange = bind(this.changeRange, this);
      this.store = bind(this.store, this);
      this.getAvailability = bind(this.getAvailability, this);
      this.done = bind(this.done, this);
      this.createReservation = bind(this.createReservation, this);
      return ReservationsChangeController.__super__.constructor.apply(this, arguments);
    }

    ReservationsChangeController.prototype.createReservation = function() {
      var reservation;
      reservation = new App.Reservation({
        model_id: this.modelId,
        start_date: this.getStartDate().format("YYYY-MM-DD"),
        end_date: this.getEndDate().format("YYYY-MM-DD"),
        inventory_pool_id: this.getSelectedInventoryPool().id,
        quantity: 1
      });
      return App.Reservation.ajaxChange(reservation, "create", {});
    };

    ReservationsChangeController.prototype.done = function(data) {
      App.Reservation.trigger("refresh");
      return ReservationsChangeController.__super__.done.apply(this, arguments);
    };

    ReservationsChangeController.prototype.getAvailability = function(inventoryPool) {
      return this.availabilities[inventoryPool.id].withoutLines(this.reservations);
    };

    ReservationsChangeController.prototype.selectFirstInventoryPool = function() {
      var id, option;
      id = this.reservations[0].inventory_pool_id;
      option = this.inventoryPoolSelect.find("option[data-id='" + id + "']");
      if (option.length) {
        return option.prop("selected", true);
      }
    };

    ReservationsChangeController.prototype.store = function() {
      var deletionDone, difference, finish, fn, i, j, len, line, ref, reservationsToBeDestroyed, results, time;
      difference = this.getQuantity() - this.quantity;
      if (difference < 0) {
        reservationsToBeDestroyed = this.reservations.slice(0, +(Math.abs(difference) - 1) + 1 || 9e9);
        deletionDone = _.after(reservationsToBeDestroyed.length, this.changeRange);
        fn = function(line) {
          return App.Reservation.ajaxChange(line, "destroy", {}).done((function(_this) {
            return function() {
              line.remove();
              return deletionDone();
            };
          })(this));
        };
        for (i = 0, len = reservationsToBeDestroyed.length; i < len; i++) {
          line = reservationsToBeDestroyed[i];
          fn(line);
        }
        return this.reservations = _.reject(this.reservations, function(l) {
          return _.include(reservationsToBeDestroyed, l);
        });
      } else if (difference > 0) {
        finish = _.after(difference, this.changeRange);
        results = [];
        for (time = j = 1, ref = difference; 1 <= ref ? j <= ref : j >= ref; time = 1 <= ref ? ++j : --j) {
          results.push(this.createReservation().done((function(_this) {
            return function(datum) {
              _this.reservations.push(App.Reservation.find(datum.id));
              return finish();
            };
          })(this)));
        }
        return results;
      } else {
        return this.changeRange();
      }
    };

    ReservationsChangeController.prototype.changeRange = function() {
      var ajax;
      if (this.getStartDate().format("YYYY-MM-DD") !== this.startDate || this.getEndDate().format("YYYY-MM-DD") !== this.endDate) {
        ajax = App.Reservation.changeTimeRange(this.reservations, this.getStartDate(), this.getEndDate(), this.getSelectedInventoryPool());
        ajax.done(this.done);
        return ajax.fail(this.fail);
      } else {
        return this.done();
      }
    };

    return ReservationsChangeController;

  })(window.App.BorrowBookingCalendarDialogController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.ReservationsCreateController = (function(superClass) {
    extend(ReservationsCreateController, superClass);

    function ReservationsCreateController() {
      this.store = bind(this.store, this);
      this.setupDates = bind(this.setupDates, this);
      this.getAvailability = bind(this.getAvailability, this);
      return ReservationsCreateController.__super__.constructor.apply(this, arguments);
    }

    ReservationsCreateController.prototype.getAvailability = function(inventoryPool) {
      return this.availabilities[inventoryPool.id];
    };

    ReservationsCreateController.prototype.setupQuantity = function() {
      return true;
    };

    ReservationsCreateController.prototype.selectFirstInventoryPool = function() {
      var i, id, inventoryPoolIds, len, option, results;
      inventoryPoolIds = App.ModelsIndexIpSelectorController.activeInventoryPoolIds;
      results = [];
      for (i = 0, len = inventoryPoolIds.length; i < len; i++) {
        id = inventoryPoolIds[i];
        option = this.inventoryPoolSelect.find("option[data-id='" + id + "']");
        if (option.length) {
          option.prop("selected", true);
          break;
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    ReservationsCreateController.prototype.setupDates = function() {
      if (sessionStorage.startDate != null) {
        this.startDateEl.val(moment(sessionStorage.startDate, "DD.MM.YYYY").format("YYYY-MM-DD"));
      } else {
        this.startDateEl.val(moment().format("YYYY-MM-DD"));
      }
      if (sessionStorage.endDate != null) {
        return this.endDateEl.val(moment(sessionStorage.endDate, "DD.MM.YYYY").format("YYYY-MM-DD"));
      } else {
        return this.endDateEl.val(moment().add(1, "days").format("YYYY-MM-DD"));
      }
    };

    ReservationsCreateController.prototype.store = function() {
      var finish, i, quantity, ref, results, time;
      quantity = this.quantityEl.val();
      finish = _.after(quantity, this.done);
      results = [];
      for (time = i = 1, ref = quantity; 1 <= ref ? i <= ref : i >= ref; time = 1 <= ref ? ++i : --i) {
        results.push(this.createReservation().done((function(_this) {
          return function(datum) {
            var reservation;
            reservation = App.Reservation.find(datum.id);
            return finish();
          };
        })(this)));
      }
      return results;
    };

    return ReservationsCreateController;

  })(window.App.ReservationsChangeController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.SearchTopbarController = (function(superClass) {
    extend(SearchTopbarController, superClass);

    SearchTopbarController.prototype.elements = {
      "input#search_term": "input",
      "i": "icon",
      ".addon": "addon",
      "#search-autocomplete": "autocompleteContainer",
      "form": "form"
    };

    SearchTopbarController.prototype.events = {
      "preChange input": "search",
      "blur input": "close",
      "focus input": "open",
      "submit form": "submit"
    };

    function SearchTopbarController() {
      this.submit = bind(this.submit, this);
      this.autocomplete = bind(this.autocomplete, this);
      this.fetchModels = bind(this.fetchModels, this);
      this.keydown = bind(this.keydown, this);
      this.close = bind(this.close, this);
      this.open = bind(this.open, this);
      this.finished = bind(this.finished, this);
      this.loading = bind(this.loading, this);
      this.search = bind(this.search, this);
      SearchTopbarController.__super__.constructor.apply(this, arguments);
      this.input.preChange();
    }

    SearchTopbarController.prototype.search = function() {
      if (!this.input.val().length) {
        return false;
      }
      this.loading();
      return (this.fetchModels()).done((function(_this) {
        return function(data) {
          var datum;
          _this.models = (function() {
            var i, len, results;
            results = [];
            for (i = 0, len = data.length; i < len; i++) {
              datum = data[i];
              results.push(App.Model.find(datum.id));
            }
            return results;
          })();
          _this.finished();
          return _this.autocomplete();
        };
      })(this));
    };

    SearchTopbarController.prototype.loading = function() {
      this.icon.detach();
      return this.addon.html(App.Render("views/loading", {
        size: "micro"
      }));
    };

    SearchTopbarController.prototype.finished = function() {
      return this.addon.html(this.icon);
    };

    SearchTopbarController.prototype.open = function() {
      this.autocompleteContainer.show();
      return this.search();
    };

    SearchTopbarController.prototype.close = function() {
      return _.delay(((function(_this) {
        return function() {
          return _this.autocompleteContainer.hide();
        };
      })(this)), 200);
    };

    SearchTopbarController.prototype.keydown = function(e) {
      if ($("*:focus").length === 0 && String.fromCharCode(e.which).length && !_.include([224, 16, 17, 18, 32, 13, 37, 38, 39, 40, 8, 9, 20, 91, 93, 27], e.which) && e.metaKey === false) {
        return this.input.val("") && this.input.focus();
      }
    };

    SearchTopbarController.prototype.fetchModels = function() {
      var arch_term, params;
      params = {};
      params.search_term = this.input.val();
      arch_term = this.input.val();
      params.per_page = 6;
      return App.Model.ajaxFetch({
        data: $.param(params)
      });
    };

    SearchTopbarController.prototype.autocomplete = function() {
      this.input.autocomplete({
        appendTo: this.autocompleteContainer,
        source: (function(_this) {
          return function(request, response) {
            var data;
            data = _.map(_this.models, function(m) {
              m.value = m.name();
              return m;
            });
            data.push({
              value: request,
              searchAll: true
            });
            return response(data);
          };
        })(this),
        focus: (function(_this) {
          return function() {
            return false;
          };
        })(this),
        select: (function(_this) {
          return function(e, ui) {
            if (ui.item.searchAll != null) {
              _this.form.submit();
              return false;
            } else {
              window.location = "/borrow/models/" + ui.item.id;
              return false;
            }
          };
        })(this)
      }).data("uiAutocomplete")._renderItem = (function(_this) {
        return function(ul, item) {
          var showAll;
          if (item.searchAll != null) {
            return showAll = $(App.Render("borrow/views/search/autocomplete/show_all")).data("value", item).appendTo(ul);
          } else {
            return $(App.Render("borrow/views/search/autocomplete/model", item)).data("value", item).appendTo(ul);
          }
        };
      })(this);
      return this.input.autocomplete("search");
    };

    SearchTopbarController.prototype.submit = function(e) {
      if (!this.input.val().length) {
        e.preventDefault();
        return false;
      }
    };

    return SearchTopbarController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateAvailabilityController = (function(superClass) {
    extend(TemplateAvailabilityController, superClass);

    function TemplateAvailabilityController() {
      this.render = bind(this.render, this);
      this.destroyTemplateLine = bind(this.destroyTemplateLine, this);
      this.changeTemplateLine = bind(this.changeTemplateLine, this);
      return TemplateAvailabilityController.__super__.constructor.apply(this, arguments);
    }

    TemplateAvailabilityController.prototype.elements = {
      "#template-lines": "templateLines"
    };

    TemplateAvailabilityController.prototype.events = {
      "click [data-change-template-line]": "changeTemplateLine",
      "click [data-destroy-template-line]": "destroyTemplateLine"
    };

    TemplateAvailabilityController.prototype.delegateEvents = function() {
      TemplateAvailabilityController.__super__.delegateEvents.apply(this, arguments);
      return App.TemplateLine.on("change", this.render);
    };

    TemplateAvailabilityController.prototype.changeTemplateLine = function(e) {
      var line, target, templateLine;
      e.preventDefault();
      target = $(e.currentTarget);
      line = target.closest(".line");
      templateLine = App.TemplateLine.findByAttribute("model_link_id", line.data("model_link_id"));
      new App.TemplateLineChangeController({
        modelId: target.data("model-id"),
        quantity: target.data("quantity"),
        startDate: target.data("start-date"),
        endDate: target.data("end-date"),
        titel: _jed("Change %s", _jed("Entry")),
        buttonText: _jed("Save change"),
        templateLine: templateLine
      });
      return false;
    };

    TemplateAvailabilityController.prototype.destroyTemplateLine = function(e) {
      var line, target, templateLine;
      e.preventDefault();
      target = $(e.currentTarget);
      line = target.closest(".line");
      templateLine = App.TemplateLine.findByAttribute("model_link_id", line.data("model_link_id"));
      if (confirm(_jed("%s will be removed from the template and not been added to your order.", templateLine.model().name()))) {
        App.TemplateLine.destroy(templateLine.id);
        if (this.templateLines.find(".line").length === 0) {
          document.location = "/borrow/templates";
        }
      }
      return false;
    };

    TemplateAvailabilityController.prototype.render = function() {
      return this.templateLines.html(App.Render("borrow/views/templates/availability/grouped_lines", App.Template.first().groupedLines()));
    };

    return TemplateAvailabilityController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplateLineChangeController = (function(superClass) {
    extend(TemplateLineChangeController, superClass);

    function TemplateLineChangeController() {
      this.getAvailability = bind(this.getAvailability, this);
      return TemplateLineChangeController.__super__.constructor.apply(this, arguments);
    }

    TemplateLineChangeController.prototype.getAvailability = function(inventoryPool) {
      return this.availabilities[inventoryPool.id];
    };

    TemplateLineChangeController.prototype.store = function() {
      App.TemplateLine.update(this.templateLine.id, {
        quantity: this.getQuantity(),
        inventory_pool_id: this.getSelectedInventoryPool().id,
        available: true,
        start_date: this.getStartDate().format("YYYY-MM-DD"),
        end_date: this.getEndDate().format("YYYY-MM-DD")
      });
      return this.done();
    };

    return TemplateLineChangeController;

  })(window.App.BorrowBookingCalendarDialogController);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplatesSelectDatesController = (function(superClass) {
    extend(TemplatesSelectDatesController, superClass);

    TemplatesSelectDatesController.prototype.elements = {
      "#start_date": "startDateEl",
      "#end_date": "endDateEl",
      "input[name='start_date']": "startDate",
      "input[name='end_date']": "endDate"
    };

    TemplatesSelectDatesController.prototype.events = {
      "change #start_date": "onChangeStartDate",
      "change #end_date": "onChangeEndDate"
    };

    function TemplatesSelectDatesController() {
      this.onChangeEndDate = bind(this.onChangeEndDate, this);
      this.onChangeStartDate = bind(this.onChangeStartDate, this);
      this.setupDates = bind(this.setupDates, this);
      TemplatesSelectDatesController.__super__.constructor.apply(this, arguments);
      this.setupDates();
    }

    TemplatesSelectDatesController.prototype.setupDates = function() {
      this.endDateEl.val(moment(this.endDate.val(), "YYYY-MM-DD").format(i18n.date.L));
      this.endDateEl.datepicker().change();
      this.startDateEl.val(moment(this.startDate.val(), "YYYY-MM-DD").format(i18n.date.L));
      this.startDateEl.datepicker().change();
      return this.startDateEl.datepicker("option", "minDate", moment().toDate());
    };

    TemplatesSelectDatesController.prototype.onChangeStartDate = function() {
      this.startDate.val(moment(this.startDateEl.val(), i18n.date.L).format("YYYY-MM-DD"));
      this.endDateEl.datepicker("option", "minDate", moment(this.startDate.val()).toDate());
      if (moment(this.endDate.val()).diff(moment(this.startDate.val()), "days") < 0) {
        return this.endDate.val(this.startDate.val());
      }
    };

    TemplatesSelectDatesController.prototype.onChangeEndDate = function() {
      return this.endDate.val(moment(this.endDateEl.val(), i18n.date.L).format("YYYY-MM-DD"));
    };

    return TemplatesSelectDatesController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TemplatesShowController = (function(superClass) {
    extend(TemplatesShowController, superClass);

    TemplatesShowController.prototype.events = {
      "change input[type='number']": "validateNumber",
      "preChange input[type='number']": "validateNumber"
    };

    function TemplatesShowController() {
      this.validateNumber = bind(this.validateNumber, this);
      this.setupNumbers = bind(this.setupNumbers, this);
      TemplatesShowController.__super__.constructor.apply(this, arguments);
      this.setupNumbers();
    }

    TemplatesShowController.prototype.setupNumbers = function() {
      return this.el.find("input[type='number']").preChange();
    };

    TemplatesShowController.prototype.validateNumber = function(e) {
      var target;
      target = $(e.currentTarget);
      if (parseInt(target.val()) > parseInt(target.attr("max"))) {
        return target.val(target.attr("max"));
      } else if (parseInt(target.val()) < parseInt(target.attr("min"))) {
        return target.val(target.attr("min"));
      } else if (target.val().match(/\D/)) {
        return target.val(target.attr("min"));
      }
    };

    return TemplatesShowController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.TimeoutCountdownController = (function(superClass) {
    extend(TimeoutCountdownController, superClass);

    TimeoutCountdownController.prototype.elements = {
      "#timeout-countdown-time": "countdownTimeEl"
    };

    function TimeoutCountdownController(options) {
      this.validateStart = bind(this.validateStart, this);
      this.timeout = bind(this.timeout, this);
      this.renderTime = bind(this.renderTime, this);
      this.refreshTime = bind(this.refreshTime, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      TimeoutCountdownController.__super__.constructor.apply(this, arguments);
      this.countdown = new App.TimeoutCountdown(App.CustomerOrder.TIMEOUT_MINUTES);
      this.validateStart();
      this.delegateEvents();
    }

    TimeoutCountdownController.prototype.delegateEvents = function() {
      $(this.countdown).on("timeUpdated", (function(_this) {
        return function() {
          return _this.renderTime();
        };
      })(this));
      $(this.countdown).on("timeout", (function(_this) {
        return function() {
          return _this.timeout();
        };
      })(this));
      this.refreshTarget.on("click", (function(_this) {
        return function() {
          return _this.refreshTime();
        };
      })(this));
      return App.Reservation.on("refresh", (function(_this) {
        return function() {
          _this.validateStart();
          return _this.refreshTime();
        };
      })(this));
    };

    TimeoutCountdownController.prototype.refreshTime = function() {
      return this.countdown.refresh();
    };

    TimeoutCountdownController.prototype.renderTime = function() {
      return this.countdownTimeEl.html(this.countdown.toString());
    };

    TimeoutCountdownController.prototype.timeout = function() {
      return document.location = "/borrow/order/timed_out";
    };

    TimeoutCountdownController.prototype.validateStart = function() {
      var all_reservations;
      all_reservations = App.Reservation.all();
      if (all_reservations.length !== 0) {
        this.countdown.start();
        this.renderTime();
        return this.el.removeClass("hidden");
      }
    };

    return TimeoutCountdownController;

  })(Spine.Controller);

}).call(this);
(function() {
  var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  window.App.UnsubmittedCustomerOrderShowController = (function(superClass) {
    extend(UnsubmittedCustomerOrderShowController, superClass);

    UnsubmittedCustomerOrderShowController.prototype.elements = {
      "#current-order-lines": "reservationsContainer",
      ".emboss.red": "conflictsWarning"
    };

    UnsubmittedCustomerOrderShowController.prototype.events = {
      "click [data-change-order-lines]": "changeReservations"
    };

    function UnsubmittedCustomerOrderShowController() {
      this.render = bind(this.render, this);
      this.changeReservations = bind(this.changeReservations, this);
      this.delegateEvents = bind(this.delegateEvents, this);
      UnsubmittedCustomerOrderShowController.__super__.constructor.apply(this, arguments);
      if (!App.CustomerOrder.timedOut) {
        this.timeoutCountdown = new App.TimeoutCountdownController({
          el: this.el.find("#timeout-countdown"),
          refreshTarget: this.el.find("#timeout-countdown")
        });
      }
    }

    UnsubmittedCustomerOrderShowController.prototype.delegateEvents = function() {
      UnsubmittedCustomerOrderShowController.__super__.delegateEvents.apply(this, arguments);
      return App.Reservation.bind("refresh", (function(_this) {
        return function(data) {
          return _this.render();
        };
      })(this));
    };

    UnsubmittedCustomerOrderShowController.prototype.changeReservations = function(e) {
      var quantity, reservations, target;
      e.preventDefault();
      target = $(e.currentTarget);
      reservations = _.map(target.data("ids"), function(id) {
        return App.Reservation.find(id);
      });
      quantity = _.reduce(reservations, (function(mem, l) {
        return mem + l.quantity;
      }), 0);
      new App.ReservationsChangeController({
        modelId: target.data("model-id"),
        reservations: reservations,
        quantity: quantity,
        startDate: target.data("start-date"),
        endDate: target.data("end-date"),
        titel: _jed("Change %s", _jed("Order")),
        buttonText: _jed("Save change"),
        withoutLines: true
      });
      return false;
    };

    UnsubmittedCustomerOrderShowController.prototype.render = function() {
      var reservations;
      reservations = App.Reservation.all();
      this.reservationsContainer.html(App.Render("borrow/views/order/grouped_and_merged_lines", App.Modules.HasLines.groupByDateAndPool(reservations, true)));
      if (_.all(reservations, function(l) {
        return l.available();
      })) {
        return this.conflictsWarning.addClass("hidden");
      }
    };

    return UnsubmittedCustomerOrderShowController;

  })(Spine.Controller);

}).call(this);
(function($) {$.views.templates("borrow/views/booking_calendar/calendar_dialog", "<div class=\'modal fade ui-modal medium\' role=\'dialog\' tabindex=\'-1\'>\n  <div class=\'modal-header row\'>\n    <div class=\'col3of5\'>\n      <h2 class=\'headline-l\'>{{>titel}}<\/h2>\n      <h3 class=\'headline-m light\'>{{>model.name()}}<\/h3>\n    <\/div>\n    <div class=\'col2of5 text-align-right\'>\n      <div class=\'modal-close\'>{{jed \"Cancel\"/}}<\/div>\n      <button class=\'button green\' disabled=\'disabled\' id=\'submit-booking-calendar\'>{{>buttonText}}<\/button>\n    <\/div>\n  <\/div>\n  <div id=\'booking-calendar-errors\'><\/div>\n  <div class=\'modal-body\'>\n    <form class=\'padding-inset-m\'>\n      <div class=\'hidden\' id=\'booking-calendar-controls\'>\n        <div class=\'col5of8 float-right\'>\n          <div class=\'row grey padding-bottom-xxs\'>\n            <div class=\'col1of2\'>\n              <div class=\'col1of2 padding-right-xs text-align-left\'>\n                <div class=\'row\'>\n                  <span>{{jed \"Start date\"/}}<\/span>\n                  <a class=\'grey fa fa-eye position-absolute-right padding-right-xxs\' id=\'jump-to-start-date\'><\/a>\n                <\/div>\n              <\/div>\n              <div class=\'col1of2 padding-right-xs text-align-left\'>\n                <div class=\'row\'>\n                  <span>{{jed \"End date\"/}}<\/span>\n                  <a class=\'grey fa fa-eye position-absolute-right padding-right-xxs\' id=\'jump-to-end-date\'><\/a>\n                <\/div>\n              <\/div>\n            <\/div>\n            <div class=\'col1of2\'>\n              <div class=\'col2of8 text-align-left\'>{{jed \"Quantity\"/}}<\/div>\n              <div class=\'col6of8 padding-left-xs text-align-left\'>{{jed \"Inventory pool\"/}}<\/div>\n            <\/div>\n          <\/div>\n          <div class=\'row\'>\n            <div class=\'col1of2\'>\n              <div class=\'col1of2 padding-right-xs\'>\n                <input autocomplete=\'off\' id=\'booking-calendar-start-date\' type=\'text\'>\n              <\/div>\n              <div class=\'col1of2 padding-right-xs\'>\n                <input autocomplete=\'off\' id=\'booking-calendar-end-date\' type=\'text\'>\n              <\/div>\n            <\/div>\n            <div class=\'col1of2\'>\n              <div class=\'col2of8\'>\n                <input autocomplete=\'off\' class=\'text-align-center\' id=\'booking-calendar-quantity\' type=\'text\' value=\'1\'>\n              <\/div>\n              <div class=\'col6of8 padding-left-xs\'>\n                <select autocomplete=\'off\' class=\'min-width-full text-ellipsis\' id=\'booking-calendar-inventory-pool\'><\/select>\n              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n      <\/div>\n      <div class=\'booking-calendar padding-top-xs\' id=\'booking-calendar\'><\/div>\n      <img class=\'loading margin-horziontal-auto margin-vertical-xl\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n    <\/form>\n  <\/div>\n  <div class=\'modal-footer\'><\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/booking_calendar/inventory_pool_option", "<option data-id=\'{{>id}}\'>\n  {{>name}}\n  (max. {{>~availability.total_borrowable}})\n<\/option>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/ip_selector", "{{>text}}\n<div class=\'arrow down\'><\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/line", "<a class=\'row line height-xs focus-hover-thin{{if availableQuantityForInventoryPools}}{{if availableQuantityForInventoryPools(~inventory_pool_ids) <= 0}} grayed-out{{/if}}{{/if}}\' data-id=\'{{>id}}\' href=\'/borrow/models/{{>id}}\'>\n  <div class=\'line-col col1of6 no-padding\'>\n    <div class=\'padding-inset-xxs text-align-center\'>\n      {{if id}}\n      <img class=\'max-height-xxs-alt max-width-xs\' src=\'/models/{{>id}}/image_thumb\'>\n      {{else}}\n      <div class=\'padding-inset-s\'>\n        <img class=\'margin-horziontal-auto max-height-xxs-alt max-width-micro\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n      <\/div>\n      {{/if}}\n    <\/div>\n  <\/div>\n  <div class=\'line-col col3of6 text-align-left\'>\n    {{if id}}\n    {{>name()}}\n    {{/if}}\n  <\/div>\n  <div class=\'line-col col1of6\'>\n    {{if id}}\n    {{>manufacturer}}\n    {{/if}}\n  <\/div>\n  <div class=\'line-col col1of6\'>\n    {{if id}}\n    <button class=\'button small focus-hover inset\' data-create-order-line data-model-id=\'{{>id}}\' title=\'Add to order\'>\n      <div class=\'padding-horizontal-xxs\'>\n        <i class=\'fa fa-plus icon-xxs\'><\/i>\n      <\/div>\n    <\/button>\n    {{/if}}\n  <\/div>\n<\/a>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/loading", "<div class=\'min-height-m min-width-full\'>\n  <div class=\'row min-height-s\'><\/div>\n  <div class=\'row\'>\n    <img class=\'margin-horziontal-auto\' src=\'/assets/loading-4eebf3d6e9139e863f2be8c14cad4638df21bf050cea16117739b3431837ee0a.gif\'>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/page", "<span class=\'page\' data-page=\'{{> ~page}}\'>\n  {{for ~entries}}\n  {{partial \'borrow/views/models/index/line\'/}}\n  {{/for}}\n<\/span>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/property", "<div class=\'row\'>\n  <div class=\'col1of2\'>{{>key}}<\/div>\n  <div class=\'col1of2\'>{{>value}}<\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/sorting", "{{if sort == \"manufacturer\"}}\n{{jed \"Manufacturer\"/}}\n{{else sort == \"name\"}}\n{{jed \"Model\"/}}\n{{/if}}\n{{if order == \"asc\"}}\n<i class=\'fa fa-circle-arrow-up icon-xs\'><\/i>\n{{else order == \"desc\"}}\n<i class=\'fa fa-circle-arrow-down icon-xs\'><\/i>\n{{/if}}\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/index/tooltip", "<div class=\'padding-inset-s width-xl-alt\'>\n  <div class=\'row\'>\n    {{if amount_of_images != 0}}\n    <div class=\'col1of4 text-align-center emboss white min-width-s padding-inset-s\' style=\'max-height: 120px\'>\n      {{count amount_of_images}}\n      <img class=\'margin-bottom-s max-height-s max-width-s\' src=\'/models/{{>#parent.data.id}}/image_thumb?offset={{>count}}\'>\n      {{/count}}\n    <\/div>\n    {{/if}}\n    <div class=\'{{if amount_of_images == 0}}row{{else}}col3of4 padding-left-m{{/if}}\' style=\'min-height: 120px\'>\n      <div class=\'row\'>\n        <div class=\'headline-s\'>{{>name()}}<\/div>\n      <\/div>\n      <div class=\'row\'>\n        <p class=\'paragraph-s margin-top-s text-align-left\'>{{>description}}<\/p>\n      <\/div>\n      {{if propertiesToDisplay.length}}\n      <div class=\'row margin-top-m padding-bottom-m padding-inset-s\'>\n        {{for propertiesToDisplay}}\n        <div class=\'row margin-top-xs\'>\n          <div class=\'col1of3 text-align-right text-ellipsis\'>\n            <strong>{{>key/}}<\/strong>\n          <\/div>\n          <div class=\'col2of3 padding-left-s\'>{{>value}}<\/div>\n        <\/div>\n        {{/for}}\n      <\/div>\n      {{/if}}\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/models/show/collapsed_properties", "<div>\n  <div class=\'row height-xs margin-bottom-s\'>\n    <div class=\'pearl\' id=\'properties-toggle\'>\n      <span id=\'show-all-properties-text\'>\n        <i class=\'fa fa-expand-alt\'><\/i>\n        {{jed \"Show all properties\"/}}\n      <\/span>\n      <span class=\'hidden\' id=\'show-less-properties-text\'>\n        <i class=\'fa fa-collapse-alt\'><\/i>\n        {{jed \"Show less properties\"/}}\n      <\/span>\n    <\/div>\n  <\/div>\n  <div class=\'collapsed\' id=\'collapsed-properties\'>\n    <div class=\'row collapsed-inner\'><\/div>\n    <div class=\'row collapsed-shadow\'><\/div>\n    <div class=\'row collapsed-shadow-cover\'><\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/order/basket/line", "<div class=\'row line small\' title=\'{{>model.name()}}\'>\n  <div class=\'line-col col1of1\'>\n    <span class=\'text-ellipsis width-s-alt block\'>{{>quantity}}x {{>model.name()}}<\/span>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/order/grouped_and_merged_lines", "<div class=\'row padding-inset-l\'>\n  <div class=\'col1of7\'>\n    <h3 class=\'headline-m\'>{{localize start_date/}}<\/h3>\n  <\/div>\n  <div class=\'col5of7\'>\n    <h2 class=\'headline-m\'>{{>inventory_pool.name}}<\/h2>\n  <\/div>\n<\/div>\n<div class=\'separated-top padding-bottom-l\'>\n  {{for groups}}\n  {{partial \"borrow/views/order/order_line\" reservations/}}\n  {{/for}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/order/order_line", "<div class=\'row line\' data-ids=\'{{JSON ids/}}\'>\n  {{if !available()}}\n  <div class=\'line-info red\' title=\'Not available\'><\/div>\n  {{/if}}\n  <div class=\'line-col col1of9 padding-left-l text-align-center\'>\n    <img class=\'max-height-xxs-alt max-width-xs\' src=\'/models/{{>model_id}}/image_thumb\'>\n  <\/div>\n  <div class=\'line-col col4of9 text-align-left\'>\n    <div class=\'col1of10 text-align-right padding-right-s\'>\n      {{if subreservations}}\n      {{sum subreservations \"quantity\"/}}\n      {{else}}\n      {{> quantity}}\n      {{/if}}\n      x\n    <\/div>\n    <strong class=\'col6of10 text-ellipsis test-fix\' title=\'{{>model().name()}}\'>{{>model().name()}}<\/strong>\n    <strong class=\'col2of10 text-ellipsis padding-left-m\' title=\'{{>model().manufacturer}}\'>{{>model().manufacturer}}<\/strong>\n  <\/div>\n  <div class=\'line-col col2of9 text-align-left\'>\n    {{interval start_date end_date/}}\n    {{jed \"until\"/}}\n    {{localize end_date/}}\n  <\/div>\n  <div class=\'line-col line-actions col2of9 padding-right-l\'>\n    <div class=\'multibutton\'>\n      <button class=\'button white\' data-change-order-lines data-end-date=\'{{>end_date}}\' data-ids=\'{{JSON ids/}}\' data-model-id=\'{{>model_id}}\' data-start-date=\'{{>start_date}}\'>\n        <i class=\'fa fa-calendar\'><\/i>\n        {{jed \"Change entry\"/}}\n      <\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <span class=\'arrow down\'><\/span>\n        <\/div>\n        <div class=\'dropdown right\'>\n          <a class=\'dropdown-item red\' data-confirm=\'{{jed \'Delete\'/}}\' data-method=\'delete\' href=\'/borrow/order/remove_reservations?{{param ids \'line_ids\'/}}\'>\n            <i class=\'fa fa-trash\'><\/i>\n            {{jed \'Delete\'/}}\n          <\/a>\n        <\/div>\n      <\/div>\n    <\/div>\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/search/autocomplete/model", "<li class=\'separated-bottom exclude-last-child\'>\n  <a class=\'row\' href=\'/borrow/models/{{>id}}\' title=\'{{>name()}}\'>\n    <div class=\'col8of10\'>\n      <div class=\'row text-ellipsis\'>\n        <strong>{{>name()}}<\/strong>\n      <\/div>\n      <div class=\'row text-ellipsis\'>{{>manufacturer}}<\/div>\n    <\/div>\n    <div class=\'col2of10 text-align-center padding-left-s\'>\n      <img class=\'max-height-xxs max-width-xxs min-height-xxs min-width-xxs\' src=\'/models/{{>id}}/image_thumb\'>\n    <\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/search/autocomplete/show_all", "<li class=\'row\'>\n  <a class=\'row padding-inset-s emboss font-size-xs text-align-center\'>\n    <div class=\'row link\' type=\'submit\'>{{jed \"Show all search results\"/}}<\/div>\n  <\/a>\n<\/li>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/templates/availability/grouped_lines", "<div class=\'row padding-inset-l\'>\n  <div class=\'col1of7\'>\n    <h3 class=\'headline-m\'>{{localize start_date/}}<\/h3>\n  <\/div>\n  <div class=\'col5of7\'>\n    {{if inventory_pool}}\n    <h2 class=\'headline-m\'>{{>inventory_pool.name}}<\/h2>\n    {{/if}}\n  <\/div>\n<\/div>\n<div class=\'separated-top padding-bottom-l\'>\n  {{partial \"borrow/views/templates/availability/line\" reservations/}}\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function($) {$.views.templates("borrow/views/templates/availability/line", "<div class=\'row line\' data-model_link_id=\'{{>model_link_id}}\'>\n  <input name=\'reservations[][model_id]\' type=\'hidden\' value=\'{{>model_id}}\'>\n  <input name=\'reservations[][quantity]\' type=\'hidden\' value=\'{{>quantity}}\'>\n  <input name=\'reservations[][start_date]\' type=\'hidden\' value=\'{{>start_date}}\'>\n  <input name=\'reservations[][end_date]\' type=\'hidden\' value=\'{{>end_date}}\'>\n  <input name=\'reservations[][inventory_pool_id]\' type=\'hidden\' value=\'{{>inventory_pool_id}}\'>\n  {{if !available}}\n  <div class=\'line-info red\' title=\'{{jed \'Not available\'/}}\'><\/div>\n  {{/if}}\n  <div class=\'line-col col1of9 padding-left-s text-align-center\'>\n    <img class=\'max-height-xxs-alt max-width-xs\' src=\'/models/{{>model_id}}/image_thumb\'>\n  <\/div>\n  <div class=\'line-col col5of9 text-align-left\'>\n    <div class=\'col1of10 text-align-right padding-right-s\'>\n      {{>quantity}}\n      x\n    <\/div>\n    <strong class=\'col6of10 text-ellipsis test-fix\' title=\'{{>model().name()}}\'>{{>model().name()}}<\/strong>\n    <strong class=\'col2of10 text-ellipsis padding-left-m\' title=\'{{>model().manufacturer}}\'>{{>model().manufacturer}}<\/strong>\n  <\/div>\n  <div class=\'line-col col1of9 text-align-left\'>\n    {{interval start_date end_date/}}\n    {{jed \"until\"/}}\n    {{localize end_date/}}\n  <\/div>\n  <div class=\'line-col line-actions col2of9\'>\n    {{if unborrowable}}\n    <button class=\'button red\' data-destroy-template-line>\n      <i class=\'fa fa-trash\'><\/i>\n      {{jed \"Delete\" /}}\n    <\/button>\n    {{else}}\n    <div class=\'multibutton\'>\n      <button class=\'button white\' data-change-template-line data-end-date=\'{{> end_date}}\' data-model-id=\'{{> model_id}}\' data-quantity=\'{{> quantity}}\' data-start-date=\'{{> start_date}}\'>\n        <i class=\'fa fa-calendar\'><\/i>\n        {{jed \"Change\"/}}\n      <\/button>\n      <div class=\'dropdown-holder inline-block\'>\n        <div class=\'button white dropdown-toggle\'>\n          <span class=\'arrow down\'><\/span>\n        <\/div>\n        <div class=\'dropdown right\'>\n          <a class=\'dropdown-item red\' data-destroy-template-line>\n            <i class=\'fa fa-trash\'><\/i>\n            {{jed \"Delete\"/}}\n          <\/a>\n        <\/div>\n      <\/div>\n    <\/div>\n    {{/if}}\n  <\/div>\n<\/div>\n");})((typeof jQuery !== "undefined" && jQuery !== null) ? jQuery : {views: jsviews});
(function() {
  App.Tooltip.interactive = false;

}).call(this);
