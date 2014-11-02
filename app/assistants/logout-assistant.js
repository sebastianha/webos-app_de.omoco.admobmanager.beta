function LogoutAssistant() {

}

LogoutAssistant.prototype.setup = function() {
	this.appMenuModel = {
		visible: true,
		items: [
			{ label: $L("About"), command: 'about' }
		]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {omitDefaultItems: true}, this.appMenuModel);
	
	this.spinnerLAttrs = {spinnerSize: 'large'};
	this.spinnerModel = {spinning: true};
	this.controller.setupWidget('waiting_spinner', this.spinnerLAttrs, this.spinnerModel);
	
	this.logout();
}

LogoutAssistant.prototype.logout = function() {
	var url = "https://api.admob.com/v2/auth/logout";
	var data = "client_key=" + ADMOBApiKey + "&token=" + ADMOBApiToken;
	
	var myAjax = new Ajax.Request(
		url, {
			method: 'POST',
			evalJSON: 'force',
			postBody: data,
			onSuccess: function(resp) {
				if (resp.responseJSON.errors.length == 0) {
					ADMOBApiToken = "";
					Mojo.Log.error("Logout successful.");
					$('message').innerHTML = "<center>Logout successful.</center>";
					Mojo.Controller.stageController.swapScene("login");
				} else {
					Mojo.Log.error("Admob error logging out: " + resp.responseJSON.errors[0].msg);
					$('message').innerHTML = "<center>Logout failed: " + resp.responseJSON.errors[0].msg + "</center>";
				}
			}.bind(this),
			onFailure: function(transport) {
				Mojo.Log.error("Network error logging out.");
				$('message').innerHTML = "<center>Logout failed: Network error.</center>";
			}
		}
	);
}

LogoutAssistant.prototype.activate = function(event) {

}

LogoutAssistant.prototype.deactivate = function(event) {

}

LogoutAssistant.prototype.cleanup = function(event) {

}
