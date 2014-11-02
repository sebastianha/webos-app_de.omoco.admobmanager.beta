function LoginAssistant(initialStart) {
	this.initialStart = initialStart;
}

LoginAssistant.prototype.setup = function() {
	this.appMenuModel = {
		visible: true,
		items: [
			{ label: $L("About"), command: 'about' }
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	ADMOBEmail = "";
	ADMOBPassword = "";
	ADMOBApiKey = "";
	ADMOBApiToken = "";
	this.autoLogin = false;
	
	var cookie = new Mojo.Model.Cookie("prefs");
	var prefs = cookie.get();
	if(prefs != null)
	{
		ADMOBEmail = prefs.email;
		ADMOBPassword = prefs.password;
		ADMOBApiKey = prefs.apikey;
		this.autoLogin = prefs.autologin;
	}
	
	this.autoLogin2 = this.autoLogin;
	if(!this.initialStart)
		this.autoLogin2 = false;
	
	if(ADMOBApiKey == "")
		$('apikeyinfo').style.display = "block";
	
	var loginemailAttr = {
		hintText: 'Enter AdMob E-Mail...',
		modelProperty: 'original', 
		multiline: false,
		textCase: Mojo.Widget.steModeLowerCase,
		focus: false
	};
	var loginemailModel = {
		'original' : ADMOBEmail,
		disabled: false
	};
	this.controller.setupWidget('loginemail', loginemailAttr, loginemailModel);
	
	var loginpasswordAttr = {
		hintText: 'Enter AdMob Password...',
		modelProperty: 'original', 
		multiline: false,
		textCase: Mojo.Widget.steModeLowerCase,
		focus: false
	};
	var loginpasswordModel = {
		'original' : ADMOBPassword,
		disabled: false
	};
	this.controller.setupWidget('loginpassword', loginpasswordAttr, loginpasswordModel);
	
	var loginapikeyAttr = {
		hintText: 'Enter AdMob API Key...',
		modelProperty: 'original', 
		multiline: false,
		textCase: Mojo.Widget.steModeLowerCase,
		focus: false
	};
	var loginapikeyModel = {
		'original' : ADMOBApiKey,
		disabled: false
	};
	this.controller.setupWidget('loginapikey', loginapikeyAttr, loginapikeyModel);
	
	this.controller.setupWidget('login', 
    	this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Login',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
	
	this.controller.listen($('login'),Mojo.Event.tap, this.loginTapped.bind(this));

	var tattr3 = {};
	tModel3 = {value: this.autoLogin, disabled: false};
	this.controller.setupWidget('autologintoggle', tattr3, tModel3);
	Mojo.Event.listen(this.controller.get('autologintoggle'),Mojo.Event.propertyChange,this.togglePressed.bind(this));
	
	this.spinnerLAttrs = {spinnerSize: 'large'};
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('waiting_spinner', this.spinnerLAttrs, this.spinnerModel);
	
	if(this.autoLogin2) {
		$('autologindiv').style.display = "block";
		this.login();	
	} else {
		$('logindiv').style.display = "block";
	}
}

LoginAssistant.prototype.togglePressed = function(event){
	ADMOBEmail = this.controller.get("loginemail").mojo.getValue();
	ADMOBPassword = this.controller.get("loginpassword").mojo.getValue();
	ADMOBApiKey = this.controller.get("loginapikey").mojo.getValue();
	this.autoLogin = tModel3.value;
	
	var cookie = new Mojo.Model.Cookie("prefs");
	cookie.put({
		email: ADMOBEmail,
		password: ADMOBPassword,
		apikey: ADMOBApiKey,
		autologin: this.autoLogin
	});
}

LoginAssistant.prototype.loginTapped = function(event){
	ADMOBEmail = this.controller.get("loginemail").mojo.getValue();
	ADMOBPassword = this.controller.get("loginpassword").mojo.getValue();
	ADMOBApiKey = this.controller.get("loginapikey").mojo.getValue();
	this.autoLogin = tModel3.value;
	
	var cookie = new Mojo.Model.Cookie("prefs");
	cookie.put({
		email: ADMOBEmail,
		password: ADMOBPassword,
		apikey: ADMOBApiKey,
		autologin: this.autoLogin
	});
	
	this.login();
}

LoginAssistant.prototype.login = function() {
	var url = "https://api.admob.com/v2/auth/login";
	var data = "client_key=" + ADMOBApiKey + "&email=" + ADMOBEmail + "&password=" + ADMOBPassword;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'POST',
			evalJSON: 'force',
			postBody: data,
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					ADMOBApiToken = resp.responseJSON.data.token;
					Mojo.Log.error("Login successful: " + ADMOBApiToken + ".");

					Mojo.Controller.stageController.swapScene("sites");
				} else {
					Mojo.Log.error("Admob error logging in: " + resp.responseJSON.errors[0].msg);
					Mojo.Controller.errorDialog("Login failed: " + resp.responseJSON.errors[0].msg);
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error logging in.");
				Mojo.Controller.errorDialog("Login failed: Network error.");
			}
		}
	);
}

LoginAssistant.prototype.activate = function(event) {

}

LoginAssistant.prototype.deactivate = function(event) {

}

LoginAssistant.prototype.cleanup = function(event) {

}
