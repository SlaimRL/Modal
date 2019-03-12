** JS **

var socket = io.connect('https://www.rlcrates.net:5555', {secure: true});

socket.on('item-won', function(liveDropItem){
	if ($('.live-drop > div').length > 15) 
	{
		$('.live-drop').children('div').last().remove();
	}

	$('.live-drop').prepend(liveDropItem);
});

$('.modal-content').on('click', function(event){
	event.stopPropagation();
});


function modal(modal, content){
	$(modal).addClass("animate-modal");
	$(content).addClass("animate-modal-content");
	$(".close-button").click(function(){
		$(modal).removeClass("animate-modal");
		$(content).removeClass("animate-modal-content");
		if (modal == '#withdraw-modal') {
			location.reload(true);
		}
	});
	$(document).click(function(event) { 
		if(!$(event.target).closest(content).length) {
			if($(modal).is(":visible")) {
				$(modal).removeClass("animate-modal");
				$(content).removeClass("animate-modal-content");
				if (modal == '#withdraw-modal') {
					location.reload(true);
				}
			}
		}
	});
};

$("#redeemBtn").click(function(event){
	event.stopPropagation();
	modal('#redeem-modal', '#redeem-modal-content');
});

$("#loginBtn").click(function(event){
	event.stopPropagation();
	modal('#login', '#login-content');
});

$("#registerBtn").click(function(event){
	event.stopPropagation();
	$("#login").removeClass("animate-modal")
	modal('#register', '#register-content');
});

$("#loginhere").click(function(event){
	event.stopPropagation();
	$("#register").removeClass("animate-modal")
	modal('#login', '#login-content');
});

$(".deposit-funds").click(function(event){
	event.stopPropagation();
	modal("#modal", "#modal-content");
});

$(document).delegate('.inventory-item', 'click', function(){
	var itemIdx = $(this).data("idx");
	var icon = $(this).find('i');
	var selectedItems = [];
	var newSelected = `<div class="active-item">
	<img src="` + $('.item-image', this).attr('src') + `">
	<div class="active-item-info">
	<div class="item-name active-name">`
	+ $('.item-name', this).html() + 
	`</div>
	<div class="item-price">
	<img src="../style/images/currency-icon.png"><span>` + $(this).find('.item-price-value').text() + `</span>
	</div>
	</div>
	</div>`;
	var selectedId = $(newSelected).data('id', itemIdx);
	selectedItems[itemIdx] = selectedId;

	if($(icon).is(":visible")){
		$(icon).removeClass('visible-icon');
		$('.active-item').filter(function(){
			return $(this).data('id') === itemIdx;
		}).remove();
	}
	else{
		$(icon).addClass('visible-icon');
		$('.selected-items').append(selectedId);
	}
});

$('.sell-button').on('click', function(){
	var selectedItems = document.getElementsByClassName('active-item');
	var hayError = false;
	
	$.each(selectedItems, function(i)
	{
		$(document).ajaxStart(function() { $('.sell-button').prop("disabled",true); });
		$(document).ajaxStart(function() { $('.withdraw-button').prop("disabled",true); });
		var item = selectedItems[i];
		var nameFormat = $(item).find('.active-name').find('f').text().trim();
		var inventoryID = $(item).data('id');
		$.ajax({
			type: 'POST',
			url: 'https://www.rlcrates.net/php/sell-item.php',
			data: {
				itemName : nameFormat,
				inventoryID : inventoryID,
				fromCrate : 'false'
			},
			success: function(){
				$(document).ajaxStop(function() {
					location.reload(true);
				});
			},
			error: function(){
				hayError = true;
			}
		});
	});
	$(document).ajaxStop(function() {
		if (hayError) {
			if(!alert('Error selling an item')){window.location.reload();};
		}
	});
});

$('.withdraw-button').on('click', function(){
	var selectedItems = document.getElementsByClassName('active-item');
	var nameFormat = [];
	var inventoryIDs = [];
	var hayError = false;
	var insuficientDeposit = false;
	
	if ($('.selected-items').children().length != 0)
	{
		$.each(selectedItems, function(i)
		{
			$(document).ajaxStart(function() { $('.sell-button').prop("disabled",true); });
			$(document).ajaxStart(function() { $('.withdraw-button').prop("disabled",true); });
			var item = selectedItems[i];

			nameFormat[i] = $(item).find('.active-name').find('span:first-child').text().trim();
			inventoryIDs[i] = $(item).data('id');
		});
		$.ajax({
			type: 'POST',
			url: 'https://www.rlcrates.net/php/withdraw-item.php',
			data: {
				itemsName : nameFormat,
				inventoryIDs : inventoryIDs,
				fromCrate : 'false'
			},
			success: function(){
				$(document).ajaxStop(function() {
					modal('#withdraw-modal', '#withdraw-modal-content');
				});
			},
			error: function(xhr, textStatus, error){
				if (xhr.status == 401) {
					insuficientDeposit = true;
				} else {
					hayError = true;
				}
			}
		});
		$(document).ajaxStop(function() {
			if (hayError) {
				if(!alert('Error withdrawing an item')){window.location.reload();};
			} else if (insuficientDeposit) {
				if(!alert('You have to deposit $3 to redeem items')){window.location.reload();};
			}
		});
	}
});

$('.withdraw-modal-button').on('click', function(){
	location.reload(true);
});

function validateMoneyForm(){
	var validated = true;

	var money = $('.money-input').val();
	var moneyFormatErr = "";
	if (money == "" || money == null) {
		moneyFormatErr = "An amount is required";
		validated = false;
	} else if (!validateMoneyFromat(money)) {
		moneyFormatErr = "Invalid format";
		validated = false;
	} else if (money < 3){
		moneyFormatErr = "The Minimum amount is $3";
		validated = false;
	}
	$('#refill-error').html(moneyFormatErr);
	return validated;
}

function validateMoneyFromat(money){
	var recurr = /^((\d{1,2}(,\d{3})+)|(\d+)(\.\d{1,2})?)$/;
	return recurr.test(money);
}

function togglePayPalButton(actions) {
    return validateMoneyForm() ? actions.enable() : actions.disable();
}

function onChangeMoneyInput(handler) {
	document.querySelector('.money-input').addEventListener('change', handler);
}

paypal.Button.render({
	env: 'production',
	style: {
		label: 'pay',
		size:  'small',    
		shape: 'rect',     
		color: 'blue',     
		tagline: false    
	},
	client: {
		sandbox: 'AQIapNZrhteX_nJJ7kGZVfRNA64dZ6H7Y5MKWa5wnb7jpdWALRuhhW9lll6qGcZEOwp5pC19yiPf9V_U',
		production: 'AUaT7a8u0b40jg2bclhgMdIO9cfz6Z5j8CPHQ22Nz0ymXtQ5w19Zq2melOOfLVEwN2f3o0zf0a0WqoZ8'
	},
	payment: function (data, actions) {
		var moneyInput = parseFloat($('.money-input').val());
		var tax = Math.round((moneyInput * 0.0269 + 0.3) * 100) / 100;
		var total = Math.round((moneyInput + tax) * 100) / 100;

		return actions.payment.create({
			transactions: [{
				amount: {
					total: moneyInput + tax,
					currency: 'USD',
					details: {
						subtotal: moneyInput,
						tax: tax
					}
				},
				custom: $('#steamid').text()
			}]
		});
	},
	commit: true,
	validate: function(actions) {
		togglePayPalButton(actions);

		onChangeMoneyInput(function() {
			togglePayPalButton(actions);
		});
	},
	onClick: function() {
        validateMoneyForm();
    },
	onAuthorize: function (data, actions) {
		return actions.payment.execute()
		.then(function () {
			location.reload(true);
		});
	}
}, '#paypal-button');
