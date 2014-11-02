function SitesAssistant() {

}

SitesAssistant.prototype.setup = function() {
	this.appMenuModel = {
		visible: true,
		items: [
			{ label: $L("About"), command: 'about' },
			{ label: $L("Reload"), command: 'reload' },
			{ label: $L("Logout"), command: 'logout' }
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	this.topMenuModelItems = [
		{
			label:'Sites / Ads', toggleCmd:'showsites', items:[
				{label:$L('Sites'), command:'showsites', width:160},
				{label:$L('Ads'), command:'showads', width:160}
			]
		}
	];
	
	this.topMenuModel = {
		visible: true,
		items: this.topMenuModelItems
	};
	this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, this.topMenuModel);
	
	this.currentlyViewing = "Sites";
	this.sitesLoaded = false;
	this.sitesLoadedComplete = false;
	this.adsLoaded = false;
	this.adsLoadedComplete = false;
	
	this.admobEmail = ADMOBEmail;
	this.admobPassword = ADMOBPassword;
	this.admobApiKey = ADMOBApiKey;
	this.admobApiToken = ADMOBApiToken;
	
	this.admobSites = new Array();
	this.getAllSiteStatsCounter = 0;
	
	this.admobAds = new Array();
	this.getAllAdStatsCounter = 0;
	
	this.totalSRevenue = 0.0;
	this.totalSRequests = 0.0;
	this.totalSEcpm = 0.0;
	this.totalSFillrate = 0.0;
	
	this.totalAImpressions = 0.0;
	this.totalAClicks = 0.0;
	this.totalAEcpm = 0.0;
	this.totalACtr = 0.0;

	this.spinnerLAttrs1 = {spinnerSize: 'small'};
	this.spinnerModel1 = {spinning: false};
	this.controller.setupWidget('waiting_spinner1', this.spinnerLAttrs1, this.spinnerModel1);
	this.spinnerLAttrs2 = {spinnerSize: 'small'};
	this.spinnerModel2 = {spinning: false};
	this.controller.setupWidget('waiting_spinner2', this.spinnerLAttrs2, this.spinnerModel2);
	this.spinnerLAttrs3 = {spinnerSize: 'small'};
	this.spinnerModel3 = {spinning: false};
	this.controller.setupWidget('waiting_spinner3', this.spinnerLAttrs3, this.spinnerModel3);
	this.spinnerLAttrs4 = {spinnerSize: 'small'};
	this.spinnerModel4 = {spinning: true};
	this.controller.setupWidget('waiting_spinner4', this.spinnerLAttrs4, this.spinnerModel4);
	
	sites = [];
	sitesListModel = {listTitle:$L('AdMob Sites'), items:sites};
	this.controller.setupWidget(
		'siteslist',
		this.attributes = {
			itemTemplate:'sites/listitem',
			listTemplate:'sites/listcontainer',
			emptyTemplate:'sites/emptylist'
		},
		sitesListModel
	);
	
	ads = [];
	adsListModel = {listTitle:$L('AdMob Ads'), items:ads};
	this.controller.setupWidget(
		'adslist',
		this.attributes = {
			itemTemplate:'sites/listitem2',
			listTemplate:'sites/listcontainer',
			emptyTemplate:'sites/emptylist'
		},
		adsListModel
	);
	
	this.controller.listen($('daterange'),Mojo.Event.tap, this.daterangeTapped.bind(this));
	this.controller.listen($('sitestotal'),Mojo.Event.tap, this.daterangeTapped.bind(this));
	this.controller.listen($('adstotal'),Mojo.Event.tap, this.daterangeTapped.bind(this));
	this.controller.setupWidget("changedaterange", {});
	this.controller.listen($('setdaterange'),Mojo.Event.tap, this.setdaterangeTapped.bind(this));
	//this.controller.listen($('reload'),Mojo.Event.tap, this.reloadTapped.bind(this));
	//this.controller.listen($('logout'),Mojo.Event.tap, this.logoutTapped.bind(this));

	var now = new Date();
	var year1 = now.getFullYear();
	var month1 = now.getMonth() + 1;
	if(month1 < 10)
		month1 = "0" + month1; 
	var day1 = now.getDate();
	if(day1 < 10)
		day1 = "0" + day1; 
	this.end_date = year1 + "-" + month1 + "-" + day1;

	var startfrom = new Date(now.getTime()-1000*60*60*24*30);
	var year2 = startfrom.getFullYear();
	var month2 = startfrom.getMonth() + 1;
	if(month2 < 10)
		month2 = "0" + month2; 
	var day2 = startfrom.getDate();
	if(day2 < 10)
		day2 = "0" + day2; 
	this.start_date = year2 + "-" + month2 + "-" + day2;
	
	this.attributes = {
		label:	'Start',
		modelProperty:	'value'
	    };
	this.model = {
		value : startfrom,
	}
	this.attributes2 = {
		label:	'End',
		modelProperty:	'value'
	    };
	this.model2 = {
		value : now,
	}
	
	$('daterange').innerText = "Date Range: " + this.start_date + " - " + this.end_date;
	
	this.controller.setupWidget('startdatefield', this.attributes, this.model);
	this.controller.setupWidget('enddatefield', this.attributes2, this.model2);
	
	Mojo.Log.error(this.start_date + " " + this.end_date);
	
	this.getSites.bind(this).delay(0);
	//this.getAds.bind(this).delay(0);
}

SitesAssistant.prototype.daterangeTapped = function() {
	$('changedaterange').mojo.toggleState();
}

SitesAssistant.prototype.setdaterangeTapped = function() {
	var now = this.model2.value;
	var year1 = now.getFullYear();
	var month1 = now.getMonth() + 1;
	if(month1 < 10)
		month1 = "0" + month1; 
	var day1 = now.getDate();
	if(day1 < 10)
		day1 = "0" + day1; 
	this.end_date = year1 + "-" + month1 + "-" + day1;

	var startfrom = this.model.value;
	var year2 = startfrom.getFullYear();
	var month2 = startfrom.getMonth() + 1;
	if(month2 < 10)
		month2 = "0" + month2; 
	var day2 = startfrom.getDate();
	if(day2 < 10)
		day2 = "0" + day2; 
	this.start_date = year2 + "-" + month2 + "-" + day2;
	
	$('daterange').innerText = "Date Range: " + this.start_date + " - " + this.end_date;
	
	$('changedaterange').mojo.toggleState();
	
	this.reloadTapped();
}

SitesAssistant.prototype.reloadTapped = function() {
	this.admobSites = new Array();
	this.getAllSiteStatsCounter = 0;
	
	this.admobAds = new Array();
	this.getAllAdStatsCounter = 0;
	
	this.totalSRevenue = 0.0;
	this.totalSRequests = 0.0;
	this.totalSEcpm = 0.0;
	this.totalSFillrate = 0.0;
	
	this.totalAImpressions = 0.0;
	this.totalAClicks = 0.0;
	this.totalAEcpm = 0.0;
	this.totalACtr = 0.0;
	
	sitesListModel.items = [];
	this.controller.modelChanged(sitesListModel);
	
	adsListModel.items = [];
	this.controller.modelChanged(adsListModel);
	
	$('sitestotal').innerHTML = "" +
		"<div x-mojo-element=\"Spinner\" id=\"waiting_spinner\" style=\"margin:auto;z-index:1500;position:absolute;top:15px;left:90px\"></div>" +  
		"<div x-mojo-element=\"Spinner\" id=\"waiting_spinner\" style=\"margin:auto;z-index:1500;position:absolute;top:15px;left:250px\"></div>" +  
		"<table border=0 style='font-size:18px'>" +  
			"<tr>" + 
				"<td width=5>&nbsp;</td>" + 
				"<td width=55>Reve:</td><td width=80></td>" + 
				"<td width=10>&nbsp;</td> " + 
				"<td width=55>Requ:</td><td width=80></td>" + 
				"<td width=5>&nbsp;</td>" +  
			"</tr>" + 
			"<tr>" + 
				"<td width=5>&nbsp;</td>" + 
				"<td width=55>eCPM:</td><td width=80></td>" + 
				"<td width=10>&nbsp;</td>" + 
				"<td width=55>Fill-R:</td><td width=80></td>" + 
				"<td width=5>&nbsp;</td>" +  
			"</tr>" + 
		"</table>";
	
	$('adstotal').innerHTML = "" +
		"<div x-mojo-element=\"Spinner\" id=\"waiting_spinner\" style=\"margin:auto;z-index:1500;position:absolute;top:15px;left:144px\"></div>" + 
		"<table border=0 style='font-size:18px'>" +  
			"<tr>" + 
				"<td width=5>&nbsp;</td>" + 
				"<td width=100>Impressions:</td><td width=210></td>" +  
				"<td width=5>&nbsp;</td>" + 
			"</tr>" + 
			"<tr>" + 
				"<td width=5>&nbsp;</td>" + 
				"<td width=100>Clicks:</td><td width=210></td>" + 
				"<td width=5>&nbsp;</td>" +  
			"</tr>" + 
		"</table>";
	
	this.sitesLoaded = false;
	this.sitesLoadedComplete = false;
	this.adsLoaded = false;
	this.adsLoadedComplete = false;
	if(this.currentlyViewing == "Sites")
		this.getSites.bind(this).delay(0);
	if(this.currentlyViewing == "Ads")
		this.getAds.bind(this).delay(0);
}

SitesAssistant.prototype.logoutTapped = function() {
	Mojo.Controller.stageController.swapScene("logout");
}

SitesAssistant.prototype.sortByName = function(a, b) {
	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
	if (a.name == b.name) return 0;
}

SitesAssistant.prototype.getSites = function() {
	$('dateselector').style.display = "none";
	$('dateselectorwait').style.display = "block";
	this.appMenuModel.items[1].disabled = true;
	this.controller.modelChanged(this.appMenuModel);
	
	if(this.adsLoaded && !this.adsLoadedComplete) {
		this.sitesLoaded = true;
		this.getSites.bind(this).delay(2);
		return;		
	}
	
	if(this.currentlyViewing == "Sites") {
		this.spinnerModel1.spinning = true;
		this.controller.modelChanged(this.spinnerModel1);
		this.spinnerModel2.spinning = true;
		this.controller.modelChanged(this.spinnerModel2);	
	}
	
	var url = "http://api.admob.com/v2/site/search?client_key=" + this.admobApiKey + "&token=" + this.admobApiToken;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					this.sitesLoaded = true;
					
					Mojo.Log.error("Getting sites successful.");
					this.admobSites = resp.responseJSON.data;
					
					this.admobSites.sort(this.sortByName);
					
					sitesListModel.items = this.admobSites;
					this.controller.modelChanged(sitesListModel);
					
					this.getAllSiteStats.bind(this).delay(1);
				} else {
					Mojo.Log.error("Admob error getting sites: " + resp.responseJSON.errors[0].msg);
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error getting sites.");
			}
		}
	);
}

SitesAssistant.prototype.getAllSiteStats = function(event) {
	this.getSiteStats(this.getAllSiteStatsCounter, this.admobSites[this.getAllSiteStatsCounter].id, this.start_date, this.end_date);

	this.getAllSiteStatsCounter++;
	
	if(this.getAllSiteStatsCounter < this.admobSites.length)
		this.getAllSiteStats.bind(this).delay(1);
}

SitesAssistant.prototype.getSiteStats = function(rowId, siteId, startDate, endDate){
	var url = "http://api.admob.com/v2/site/stats?client_key=" + this.admobApiKey + "&token=" + this.admobApiToken + "&site_id=" + siteId + "&start_date=" + startDate + "&end_date=" + endDate;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					Mojo.Log.error("Getting site stats for id " + siteId + " successful.");
					
					this.admobSites[rowId].revenue = Math.round(resp.responseJSON.data[0].revenue*100.0)/100.0;
					this.totalSRevenue += resp.responseJSON.data[0].revenue;
					this.admobSites[rowId].requests = resp.responseJSON.data[0].requests;
					this.totalSRequests += resp.responseJSON.data[0].requests;
					this.admobSites[rowId].ecpm = Math.round(resp.responseJSON.data[0].ecpm*100.0)/100.0;
					this.totalSEcpm += resp.responseJSON.data[0].ecpm;
					this.admobSites[rowId].fillrate = Math.round(resp.responseJSON.data[0].fill_rate*10000.0)/100.0;
					this.totalSFillrate += resp.responseJSON.data[0].fill_rate;
					
					if(rowId == this.admobSites.length-1)
						$('sitestotal').innerHTML = "" +
							"<table border=0 style='font-size:18px'>" + 
								"<tr>" + 
									"<td width=5>&nbsp;</td>" + 
									"<td width=55>Reve:</td><td width=80 align=right>$" + (Math.round(this.totalSRevenue*100.0)/100.0) + "</td>" + 
									"<td width=10>&nbsp;</td>" + 
									"<td width=55>Requ:</td><td width=80 align=right>" + this.totalSRequests + "</td>" + 
									"<td width=5>&nbsp;</td>" + 
								"</tr>" + 
								"<tr>" + 
									"<td width=5>&nbsp;</td>" + 
									"<td width=55>eCPM:</td><td width=80 align=right>$" + (Math.round(this.totalSEcpm*100.0/this.admobSites.length)/100.0) + "</td>" + 
									"<td width=10>&nbsp;</td>" + 
									"<td width=55>Fill-R:</td><td width=80 align=right>" + (Math.round(this.totalSFillrate*10000.0/this.admobSites.length)/100.0) + "%</td>" + 
									"<td width=5>&nbsp;</td>" + 
								"</tr>" + 
							"</table>" + 
						"";
					
					//if(rowId == this.admobSites.length-1)
						//this.getAds.bind(this).delay(1);

					if(rowId == this.admobSites.length-1) {
						this.sitesLoadedComplete = true;
						this.spinnerModel1.spinning = false;
						this.controller.modelChanged(this.spinnerModel1);
						this.spinnerModel2.spinning = false;
						this.controller.modelChanged(this.spinnerModel2);
						$('dateselector').style.display = "block";
						$('dateselectorwait').style.display = "none";
						this.appMenuModel.items[1].disabled = false;
						this.controller.modelChanged(this.appMenuModel);
					}
					
					sitesListModel.items = this.admobSites;
					this.controller.modelChanged(sitesListModel);
				} else {
					Mojo.Log.error("Admob error getting site stats: " + resp.responseJSON.errors[0].msg);
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error getting site stats for id " + siteId + ".");
			}
		}
	);
}


SitesAssistant.prototype.getAds = function() {
	$('dateselector').style.display = "none";
	$('dateselectorwait').style.display = "block";
	this.appMenuModel.items[1].disabled = true;
	this.controller.modelChanged(this.appMenuModel);
	
	if(this.sitesLoaded && !this.sitesLoadedComplete) {
		this.adsLoaded = true;
		this.getAds.bind(this).delay(2);
		return;	
	}

	if(this.currentlyViewing == "Ads") {
		this.spinnerModel3.spinning = true;
		this.controller.modelChanged(this.spinnerModel3);	
	}
	
	var url = "http://api.admob.com/v2/ad/search?client_key=" + this.admobApiKey + "&token=" + this.admobApiToken;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					this.adsLoaded = true;
					
					Mojo.Log.error("Getting ads successful.");
					this.admobAds = resp.responseJSON.data;
					
					this.admobAds.sort(this.sortByName);
					
					adsListModel.items = this.admobAds;
					this.controller.modelChanged(adsListModel);
					
					this.getAllAdStats.bind(this).delay(1);
				} else {
					Mojo.Log.error("Admob error getting ads: " + resp.responseJSON.errors[0].msg);
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error getting ads.");
			}
		}
	);
}

SitesAssistant.prototype.getAllAdStats = function(event) {
	this.getAdStats(this.getAllAdStatsCounter, this.admobAds[this.getAllAdStatsCounter].id, this.start_date, this.end_date);

	this.getAllAdStatsCounter++;
	
	if(this.getAllAdStatsCounter < this.admobAds.length)
		this.getAllAdStats.bind(this).delay(1);
}

SitesAssistant.prototype.getAdStats = function(rowId, adId, startDate, endDate){
	var url = "http://api.admob.com/v2/ad/stats?client_key=" + this.admobApiKey + "&token=" + this.admobApiToken + "&ad_id=" + adId + "&start_date=" + startDate + "&end_date=" + endDate;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					Mojo.Log.error("Getting site ads for id " + adId + " successful.");
					
					
					this.admobAds[rowId].impressions = resp.responseJSON.data[0].impressions;
					this.totalAImpressions += resp.responseJSON.data[0].impressions;
					this.admobAds[rowId].clicks = resp.responseJSON.data[0].clicks;
					this.totalAClicks += resp.responseJSON.data[0].clicks;
					this.admobAds[rowId].ecpm = Math.round(resp.responseJSON.data[0].ecpm*100.0)/100.0;
					this.totalAEcpm += resp.responseJSON.data[0].ecpm;
					this.admobAds[rowId].ctr = Math.round(resp.responseJSON.data[0].ctr*10000.0)/100.0;
					this.totalACtr += resp.responseJSON.data[0].ctr;
					
					if(rowId == this.admobAds.length-1)
						$('adstotal').innerHTML = "" +
							"<table border=0 style='font-size:18px'>" + 
								"<tr>" +
									"<td width=5>&nbsp;</td>" + 
									"<td width=100>Impressions:</td><td width=210 align=right>" + this.totalAImpressions + "</td>" +
									"<td width=5>&nbsp;</td>" +  
								"</tr>" +
								"<tr>" +
									"<td width=5>&nbsp;</td>" + 
									"<td width=100>Clicks:</td><td width=210 align=right>" + this.totalAClicks + " (" + (Math.round(this.totalACtr*10000.0/this.admobAds.length)/100.0) + "%)</td>" +
									"<td width=5>&nbsp;</td>" +  
								"</tr>" +
							"</table>" +
						"";
					
					if(rowId == this.admobAds.length-1) {
						this.adsLoadedComplete = true;
						this.spinnerModel3.spinning = false;
						this.controller.modelChanged(this.spinnerModel3);
						$('dateselector').style.display = "block";
						$('dateselectorwait').style.display = "none";
						this.appMenuModel.items[1].disabled = false;
						this.controller.modelChanged(this.appMenuModel);
					}
					
					adsListModel.items = this.admobAds;
					this.controller.modelChanged(adsListModel);
				} else {
					Mojo.Log.error("Admob error getting ad stats: " + resp.responseJSON.errors[0].msg);
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error getting site ad for id " + adId + ".");
			}
		}
	);
}


SitesAssistant.prototype.activate = function(event) {

}

SitesAssistant.prototype.deactivate = function(event) {

}

SitesAssistant.prototype.cleanup = function(event) {

}

SitesAssistant.prototype.handleCommand = function(event){
	if (event.type == Mojo.Event.command) {
		switch (event.command) {
			case 'reload':
				this.reloadTapped();
				break;
			case 'logout':
				this.logoutTapped();
				break;
			case 'showsites':
				$('sitestotal').style.display = "block";
				$('siteslist').style.display = "block";
				$('adstotal').style.display = "none";
				$('adslist').style.display = "none";
				if(!this.sitesLoadedComplete) {
					this.spinnerModel1.spinning = true;
					this.controller.modelChanged(this.spinnerModel1);
					this.spinnerModel2.spinning = true;
					this.controller.modelChanged(this.spinnerModel2);					
				}
				this.spinnerModel3.spinning = false;
				this.controller.modelChanged(this.spinnerModel3);
				this.currentlyViewing = "Sites";
				if(!this.sitesLoaded)
					this.getSites.bind(this).delay(0);
				break;
			case 'showads':
				$('sitestotal').style.display = "none";
				$('siteslist').style.display = "none";
				$('adstotal').style.display = "block";
				$('adslist').style.display = "block";
				this.spinnerModel1.spinning = false;
				this.controller.modelChanged(this.spinnerModel1);
				this.spinnerModel2.spinning = false;
				this.controller.modelChanged(this.spinnerModel2);
				if(!this.adsLoadedComplete) {
					this.spinnerModel3.spinning = true;
					this.controller.modelChanged(this.spinnerModel3);					
				}
				this.currentlyViewing = "Ads";
				if(!this.adsLoaded)
					this.getAds.bind(this).delay(0);
				break;
		}
	}
}