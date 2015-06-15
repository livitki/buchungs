define([
        "app/ControlsMenu",
        "app/Products",
        "dojo/_base/declare",
        "dojox/calendar/MobileCalendar",
        "dojo/store/Observable",
        "dojo/store/Memory",
        "dojo/date/locale",
        "dojo/date",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/dom",
        "dojo/fx",
        "dojo/_base/fx"
    ],
    function(ControlsMenu, Products, declare, Calendar, Observable, Memory, locale, date, domStyle, domClass, dom, coreFx, baseFx) {

        var Kalendar = declare(null, {
            calendar: null,
            columnView: null,
            matrixView: null,
            viewContainer: null,
            buttonContainer: null,
            controlsMenu: null,
            selectedDate: null,
            products: null,

            constructor: function() {
                this.calendar = calendar = new Calendar({
                    store: new Observable(new Memory({data:[]})),
                    dateInterval: "month",
                    dateIntervalSteps: 1,
                    // animateRange: false,
                    columnViewProps: {
                        minHours: 0,
                        maxHours: 24
                    },
                    cssClassFunc: function(item){
                        // console.log("--- ", item, item.calendar)
                        return item.calendar;
                    },
                    style: "padding:10px;"
                });

                this.columnView = this.calendar.columnView;
                this.matrixView = this.calendar.matrixView;

                this.columnView.set("timeSlotDuration", 30);
                this.columnView.set('hourSize', 50);

                this.viewContainer = this.calendar.viewContainer;
                this.buttonContainer = this.calendar.buttonContainer;
                this.controlsMenuNode = dom.byId("controlsNode");
                this.controlsMenu = new ControlsMenu(this.calendar);
                this.products = new Products();



                this.calendar.columnView.set("styleGridCellFunc", function(node, date, hours, minutes){
                    // console.log(">>> ", node)
                  // grey out Wednesday & time range between 12pm and 2pm
                  if(hours >= 12 && hours < 14 ){
                    domClass.add(node, "greyCell");

                  }

                  this.defaultStyleGridCell(node, date, hours, minutes);
                });

                var func = function(node, date){
                  // grey out Wednesdays
                  if(date != null && date.getDay() == 3){
                    domClass.add(node, "greyCell");
                  }

                  this.defaultStyleGridCell(node, date);
                };
                // this.calendar.columnView.secondarySheet.set("styleGridCellFunc", func);
                // this.calendar.matrixView.set("styleGridCellFunc", func);
                // this.calendar.monthColumnView.set("styleGridCellFunc", func);


            },

            startup: function() {
                this.calendar.placeAt("calendarNode");
                this.calendar.startup();
                this.controlsMenu.startup();
                this.setEvents();
            },

            setEvents: function() {
                var _this = this;

                this.calendar.on("gridClick", function(item) {
                    _this.selectedDate = item.date.getHours();
                    // console.log(_this.calendar.store)
                    // console.log(">>> ", this.get("dateInterval"), item, item.date.getHours(), item.date.getMinutes());
                    if (this.get("dateInterval") == "month") {
                        _this.showControlsMenu();
                        this.set("dateInterval", "day");
                    }else{
                        _this.startEvent()
                        alert(item.date)
                        _this.addEvent(item.date);
                    }



                    this.set("date", item.date);
                    // this.columnView.set("startTimeOfDay", {hours: new Date().getHours(), duration:100})

                });
            },

            showControlsMenu: function() {

                var _this = this;
                // baseFx.animateProperty({
                //     node: _this.viewContainer,
                //     properties: { top: 100 },
                //     duration: 200
                // }).play();
                this.viewContainer.style.top = "100px";
                this.buttonContainer.style.display = "none";
                // domStyle.set(this.viewContainer, {
                //     top: 100 + "px",

                // });
                domStyle.set(this.controlsMenuNode, {
                    height: 100 + "px",
                    background: "red",
                    display: "block"
                });


            },

            startEvent: function(){
                this.calendar.viewContainer.style.width = "50%";
                this.calendar.resize();
                this.controlsMenu.addProductsNode.style.display = "block";
                this.products.draw("cart");
            },

            addEvent: function(date) {
                var _this = this;
                var item = {
                    id: (new Date()).getTime(),
                    summary: "New Event<br>safasdfa sdfasdfas df ",
                    startTime: date,
                    endTime: new Date(date.getTime()+60*60000),
                    calendar: "Retro"
                }
                // _this.calendar.store.add(item);
            }


        });
        if (!_instance) {
            var _instance = new Kalendar();
        }
        return _instance;
    });