define(["dojo/ready", "dojo/_base/declare", "dojo/on", "dojo/date/locale", "dojo/parser", "dojo/date", "dojo/_base/lang",
                    "dojo/dom", "dojo/dom-construct", "dojo/dom-class", "dojo/_base/window",
                    "dijit/registry", "dojo/query", "dojox/calendar/MatrixView", "dojox/calendar/Keyboard", "dojox/calendar/Mouse",
                    "dojox/calendar/HorizontalRenderer", "dojox/calendar/DecorationRenderer", "dojox/calendar/LabelRenderer", "dojox/calendar/ExpandRenderer", "dojo/store/Memory", "dojo/store/Observable",
                    "dijit/form/VerticalSlider", "dijit/form/NumberSpinner",
                    "dijit/form/ComboBox", "dijit/form/DateTextBox", "dijit/form/TimeTextBox", "dijit/form/TextBox",
                    "dijit/form/Button", "dijit/TitlePane", "dijit/Tooltip",
                    "dijit/form/CheckBox", "dojo/_base/fx"],

                function(ready, declare, on, locale, parser, date, lang, dom, domConstruct, domClass, win, registry, query,
                    MatrixView, CalendarKeyboard, CalendarMouse, HorizontalRenderer, DecorationRenderer, LabelRenderer, ExpandRenderer, Memory, Observable, VerticalSlider,
                    NumberSpinner, ComboBox, DateTextBox, TimeTextBox, TextBox, Button, TitlePane, Tooltip, CheckBox, fx){

                    ready(function(){
                        
                        // singleton
                        win.doc.appState = {
                            moveDisabledMap: {},
                            resizeDisabledMap: {}
                        };

                        var mergeDateTime = function(isStart){
                            var dateEditor = isStart ? itemStartDateEditor : itemEndDateEditor;
                            var timeEditor = isStart ? itemStartTimeEditor : itemEndTimeEditor;
                            var date = dateEditor.get("value");
                            var time = timeEditor.get("value");
                            date.setHours(time.getHours());
                            date.setMinutes(time.getMinutes());
                            return date;
                        };

                        var addLogEntry = function(name, content){
                            var tr = domConstruct.create("tr", null, dom.byId("logBody"), "first");
                            var td = domConstruct.create("td", null, tr);
                            td.appendChild(win.doc.createTextNode(locale.format(new Date(), {selector:"time", timePattern:"h:mm:ss"})));
                            var td = domConstruct.create("td", null, tr);
                            td.appendChild(win.doc.createTextNode(name));
                            td = domConstruct.create("td", null, tr);
                            td.appendChild(win.doc.createTextNode(content));
                        };

                        // Calendar model creation

                        var dateClassObj = Date;

                        var dataItemsTemplate = [
                            {day: 0, start: [0,0], duration: 1440, allDay:true},
                            {day: 1, start: [6,0], duration: 240},
                            {day: 1, start: [10,0], duration: 240},
                            {day: 1, start: [16,0], duration: 60},
                            {day: 2, start: [8,0], duration: 120},
                            {day: 2, start: [10,0], duration: 120},
                            {day: 2, start: [16,0], duration: 120},
                            {day: 3, start: [8,0], duration: 1440*2},
                            {day: 5, start: [0,0], duration: 1440, allDay:true},
                            {day: 6, start: [0,0], duration: 2*1440, allDay:true}
                        ];

                        var decorationItemsTemplate = [
                            {day: 2, start: [3], duration: 1440, calendar: "cal1"},
                            {day: 3, start: [4], duration: 1440, calendar: "cal1"},
                            {day: 4, start: [12], duration: 1440*2, calendar: "cal1"},
                            {day: 2, start: [9,0], duration: 1440, calendar: "cal2"},
                            {day: 3, start: [11,0], duration: 500, calendar: "cal2"},
                            {day: 4, start: [11,0], duration: 500, calendar: "cal2"}
                        ];

                        // TODO manage first day of week
                        var floorToWeek= function(d){
                            d.setHours(0);
                            d.setMinutes(0);
                            d.setSeconds(0);
                            d.setMilliseconds(0);
                            d = date.add(d, "day", -d.getDay());
                            return d;
                        };

                        var createModel = function(modelBase){

                            var someData = [];

                            var startOfWeek = new dateClassObj();
                            startOfWeek = floorToWeek(startOfWeek);

                           

                            var id;
                            for (var w=0; w<5; w++) {
                                for (var i=0; i<modelBase.length; i++) {
                                    id = (w*modelBase.length)+i;
                                    var newObj = {
                                        id: id,
                                        summary: "New Event " + id,
                                        startTime: new dateClassObj(startOfWeek.getTime()),
                                        endTime: new dateClassObj(startOfWeek.getTime()),
                                        calendar: modelBase[i].calendar ? modelBase[i].calendar : i%2 == 0 ? "cal1" : "cal2"
                                    };

                                    newObj.startTime = date.add(newObj.startTime, "day", Math.floor(Math.random()*7));
                                    newObj.startTime.setHours(modelBase[i].start[0]);
                                    newObj.startTime.setMinutes(modelBase[i].start[1]);

                                    newObj.endTime = date.add(newObj.startTime, "minute", modelBase[i].duration);

                                    if(modelBase[i].allDay != undefined){
                                        newObj.allDay = modelBase[i].allDay;
                                    }

                                    someData.push(newObj);
                                }
                                startOfWeek = date.add(startOfWeek, "day", 7);
                            }

                            return someData;

                        }

                        var itemsData = createModel(dataItemsTemplate);
                        var decorationItemsData = createModel(decorationItemsTemplate);
                        var id = itemsData.length;

                        // Calendar creation & configuration

                        matrixView = declare([MatrixView, CalendarKeyboard, CalendarMouse])({

                            store: new Observable(new Memory({data: itemsData})),
                            decorationStore: new Observable(new Memory({data: decorationItemsData})),
                            horizontalRenderer: HorizontalRenderer,
                            horizontalDecorationRenderer: DecorationRenderer,
                            labelRenderer: LabelRenderer,
                            expandRenderer: ExpandRenderer,
                            verticalGap:4,
                            cssClassFunc: function(item){
                                return item.calendar == "cal1" ? "Calendar1" : "Calendar2"
                            },
                            isItemMoveEnabled: function(item, kind){
                                return this.isItemEditable(item, kind) && win.doc.appState.moveDisabledMap[item.id] !== true;
                            },
                            isItemResizeEnabled: function(item, kind){
                                return this.isItemEditable(item, kind) && win.doc.appState.resizeDisabledMap[item.id] !== true;
                            }
                        }, "calendarNode");

                        // matrix view is *not* in a dijit container, must register resize handler
                        window.onresize = function(e){
                            matrixView.resize(e);
                        };

                        // Events management

                        matrixView.on("gridDoubleClick", function(e){

                            // create a event when double-clicking on grid.
                            var d = matrixView.floorToDay(e.date, true);

                            var item = {
                                id: id,
                                summary: "New event " + id,
                                startTime: d,
                                endTime: date.add(d, "day", 1),
                                calendar: id % 2 == 0 ? "cal1" : "cal2"
                            };
                            id++;
                            matrixView.store.add(item);

                            matrixView.set("selectedItem", item);
                            matrixView.set("focusedItem", item);
                            onMatrixViewChange(item);
                        });

                        matrixView.on("rowHeaderClick", function(e){
                            var expIndex = matrixView.getExpandedRowIndex();
                            if(expIndex == e.index){
                                matrixView.collapseRow();
                            }else if(expIndex == -1){
                                matrixView.expandRow(e.index);
                            }else{
                                var h = matrixView.on("expandAnimationEnd", function(){
                                    h.remove();
                                    matrixView.expandRow(e.index);
                                });
                                matrixView.collapseRow();
                            }
                        });

                        var editedItem;

                        var onMatrixViewChange = function(item){

                            if (item == null){
                                editedItem = null;

                               
                                calendarEditor.set("disabled", true);

                            }else{

                                editedItem = lang.mixin({}, item);

                                var allDay = item.allDay === true;

                               
                                moveEnabledCB.set("disabled", false);
                                moveEnabledCB.set("checked", win.doc.appState.moveDisabledMap[item.id] !== true);
                            }

                            var res = "";
                            if(item == null){
                                res = null;
                            }else{
                                var list = matrixView.get("selectedItems");
                                for(var i=0; i<list.length; i++){
                                    res += list[i].summary;
                                    if(i != list.length-1){
                                        res += ", ";
                                    }
                                }
                            }
                            addLogEntry("onChange", res);
                        };


                       

                        matrixView.on("change", function(e){
                            onMatrixViewChange(e.newValue);
                        });

                      
                        
                        

                        var formatItemTimeFunc = function(d, rd){
                            return rd.dateLocaleModule.format(d, {
                                selector: 'time',
                                timePattern: d.getMinutes() == 0 ? "ha":"h:mma"}
                            ).toLowerCase();
                        };


                        matrixView.on("itemClick", function(e){
                            addLogEntry("onItemClick", e.item.summary);
                        });
                        matrixView.on("itemDoubleClick", function(e){
                            addLogEntry("onItemDoubleClick", e.item.summary);
                        });ev
                        matrixView.on("gridClick", function(e){
                            addLogEntry("onGridClick", locale.format(e.date, {datePattern:"yyyy/MM/dd", timePattern:"h:mm"}));
                        });
                        matrixView.on("gridDoubleClick", function(e){
                            addLogEntry("onGridDoubleClick", locale.format(e.date, {datePattern:"yyyy/MM/dd", timePattern:"h:mm"}));
                        });

                        matrixView.on("itemRollOut", function(e){
                            addLogEntry("onItemRollOut", e.item.summary);
                        });

                        var getDataTipLabel = function(item){
                            return "<b>" + item.summary + "</b><br/><table><tr><td style='text-align:right'>" +
                                "Start:</td><td>" + matrixView.renderData.dateLocaleModule.format(item.startTime, {formatLength: "short"}) + "</td></tr><tr><td style='text-align:right'>" +
                                "End:</td><td>" + matrixView.renderData.dateLocaleModule.format(item.endTime, {formatLength: "short"}) + "</td></tr></table>";
                        };

                        matrixView.on("focusChange", function(e){
                            addLogEntry("focusChange", e.newValue ? e.newValue.summary: "null");
                        });

                        matrixView.on("itemRollOver", function(e){
                            addLogEntry("onItemRollOver", e.item.summary);
                        });

                        matrixView.on("itemEditBegin", function(e){
                            addLogEntry("onItemEditBegin", e.item.summary);
                        });

                        matrixView.on("itemEditBeginGesture", function(e){
                            addLogEntry("onItemEditBeginGesture", e.editKind + ", " + e.item.summary);
                        });

                        var showDataTipAfterLayout = false;
                        matrixView.on("itemEditMoveGesture", function(e){
                            showDataTipAfterLayout = true;
                        });

                        matrixView.on("itemEditEndGesture", function(e){
                            addLogEntry("onItemEditEndGesture", e.editKind + ", " + e.item.summary);

                            onMatrixViewChange(e.item);

                        });

                        matrixView.on("itemEditEnd", function(e){
                            addLogEntry("onItemEditEnd", e.item.summary + ", completed:" + e.completed);
                        });

                        editableCB.on("change", function(value){
                            matrixView.set("editable", value);
                        });

                        keyEditableCB.on("change", function(value){
                            matrixView.set("keyboardEditable", value);
                        });

                        liveEditCB.on("change", function(value){
                            matrixView.liveLayout = value;
                        });

                        allowSwapCB.on("change", function(value){
                            matrixView.allowStartEndSwap = value;
                        });

                        viewConstrainCB.on("change", function(value){
                            matrixView.stayInView = value;
                        });

                        resizeEnabledCB.watch("disabled", function(oldV, newV){
                            if (newV){
                                domClass.remove("resizeEnabledCBLabel", "disabled");
                            }else{
                                domClass.add("resizeEnabledCBLabel", "disabled");
                            }
                        });

                        moveEnabledCB.watch("disabled", function(oldV, newV){
                            if (newV){
                                domClass.remove("moveEnabledCBLabel", "disabled");
                            }else{
                                domClass.add("moveEnabledCBLabel", "disabled");
                            }
                        });

                        resizeEnabledCB.on("change", function(value){
                            if (matrixView.selectedItem) {
                                if (value){
                                    delete win.doc.appState.resizeDisabledMap[matrixView.selectedItem.id]
                                } else {
                                    win.doc.appState.resizeDisabledMap[matrixView.selectedItem.id] = true;
                                }
                            }
                        });

                        moveEnabledCB.on("change", function(value){
                            if (matrixView.selectedItem) {
                                if (value){
                                    delete win.doc.appState.moveDisabledMap[matrixView.selectedItem.id]
                                } else {
                                    win.doc.appState.moveDisabledMap[matrixView.selectedItem.id] = true;
                                }
                            }
                        });

                        roundToDayCB.on("change", function(value){
                            matrixView.set("roundToDay", value);
                        });

                        overlapEditor.on("change", function(value){
                            matrixView.set("percentOverlap", this.value);
                            vGapEditor.set("disabled", value!=0);
                        });

                        // the item to renderer kind functions.
                        var itemToRendererKindFuncs = [
                            null,
                            function(item){ return "horizontal"; },
                            function(item){ return item.allDay ? "horizontal" : "label"},
                            function(item){ return "label"}
                        ];

                        rendererKindEditor.set("store", new Memory({data:[
                            {id:0, label: "default"},
                            {id:1, label: "All horizontals"},
                            {id:2, label: "Only all day horizontals"},
                            {id:3, label: "All labels"}
                        ]}));

                        rendererKindEditor.watch("item", function(prop, oldValue, newValue){
                            matrixView.set("itemToRendererKindFunc", itemToRendererKindFuncs[newValue.id]);
                        });

                        fx.fadeOut({
                            node:"loadingPanel",
                            onEnd: function(node){
                                node.parentNode.removeChild(node)
                            }}).play(500);

                    });
            });