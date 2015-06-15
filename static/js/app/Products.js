define(["dojo/_base/declare", "dojo/dom", "dojo/query",
 "dojo/request", "dojo/store/Memory", "dojo/data/ObjectStore","dijit/form/Button", "dijit/form/Select"],
	function(declare, dom, query, request, Memory, ObjectStore,Button,Select){

	var Products = declare(null,{
		cart: null,
		laser: null,
		cart_buttons: [],
		laser_buttons: [],
		cart_range: [],
		laser_range: [],

		productsContainer: null,

		constructor: function(){

			this.store = new Memory({data:[]});
			this.productsContainer = dom.byId("productsNodeBody");
			this.productsOpetions = dom.byId("productsOption");

			this.Select = new Select({
				store: new Memory({data:[]}),
				labelAttr: "name",
				onChange: function(){

				}
			},this.productsOpetions);
			this.Select.startup();
		},

		loadJson: function(file){
			var _json,
				_this = this;

			request("/static/"+file+".json", {handleAs: "json", sync: true}).then(function(result){
				_json = result;
			});


			return _json;
		},

		draw: function(file){
			var _this = this;

			if(!_this[file]){
				_this[file] = this.loadJson(file);
				_this[file].forEach(function(item,n){


					if(_this[file+"_buttons"].indexOf(item.name)<0){
						_this[file+"_buttons"].push(item.name);
					}

					item.id= n;
					_this.store.put(item);
				});

				_this[file+"_buttons"].forEach(function(item){

					new Button({
						label: item,
						type: item,
						onClick: function(){
							_this.pupulateSelect(this.type);
						}
					}).placeAt(_this.productsContainer)
				})
			}
		},
		pupulateSelect: function(type){
			var _this = this,
				data = [];
			// console.log(_this.selectStore, _this.Select.store)
			// _this.selectStore.objectStore.setData([]);
			_this.store.query({name:type}).forEach(function(item){

				data.push({ abbreviation: item.range, name: item.range });
			});
			var memstore = new Memory({idProperty: "abbreviation", data: data});
			console.log(data,memstore, _this.Select.store)
			_this.Select.setStore(memstore);

		}

	});


	return Products;

});