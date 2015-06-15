define([
	"dojo/_base/declare",
	"dojo/dom",
	"dojo/dom-construct",
	"dijit/form/Button",
	"dijit/Dialog",
	"dijit/form/TimeTextBox"],
	function(declare,dom, domConstruct, Button, Dialog, TimeTextBox){

	return declare(null, {
		domNode: null,
		buttonsNode: null,
		dateNode: null,
		produtctsNode: null,
		constructor: function(KalendarInstance){
			this.calendar = KalendarInstance;
			this.domNode = dom.byId("controlsNode");
			this.dateNode = dom.byId("controlsDateNode");
			this.buttonsNode = dom.byId("controlsButtonsNode");
			this.addProductsNode = dom.byId("addProductsNode")
			this.productsNode = dom.byId("productsNode");
			this.productsNodeHeader = dom.byId("productsNodeHeader");
			console.log(this.productsNodeHeader)
		},

		startup: function(){
			this.drawMenuButtons();
		},

		drawMenuButtons: function(){
			var _this = this,
				calendar = this.calendar;
			this.backToMonth = new Button({
				label: "Zurück zu Monat",
				onClick: function(){
					// alert("Bearbeiten");
					calendar.viewContainer.style.width = "100%";
					addProductsNode.style.display = "none";
					calendar.resize();
					calendar.set("dateInterval", "month");
				}
			}).placeAt(this.buttonsNode);

			this.editEvent = new Button({
				label: "Buchung bearbeiten",
				onClick: function(){
					alert("Bearbeiten");
				}
			}).placeAt(this.buttonsNode);;

			this.addEvent = new Button({
				label: "Buchung hinzufügen",
				onClick: function(){
					// alert("Bearbeiten");
					calendar.viewContainer.style.width = "50%";
					calendar.resize();
					addProductsNode.style.display = "block";
				}
			}).placeAt(this.buttonsNode);

			this.closeProducts = new Button({
				label: "Zurück zu Kalendar",
				onClick: function(){
					// alert("Bearbeiten");
					calendar.viewContainer.style.width = "100%";
					calendar.resize();
					addProductsNode.style.display = "none";
				}
			}).placeAt(this.productsNodeHeader);

		},

		drawProductsButtons: function(productList){
			productList.forEach(function(item){
				console.log(item);
			});
		}

	})
});