inicializa_singin();

function inicializa_singin(){

	$('#btn_logon').click(function(event) {
		var erro = "";
		$('.validate').each(function(index, el) {
			if ($(this).val() == ""){
				erro = erro + " - " +  $(this).attr("description") + "\n";
			}
		});

		if(erro == ""){
			confirmaLogon();
		}else{
			alert (erro);
		}
	});

}

function confirmaLogon(){

	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: true, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "loginUsuario",dados: JSON.stringify( $('#form-logon').serializeObject())},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		if(json.code==1){
			Materialize.toast(json.status, 5000);
			localStorage.nomeUsuario = json['dadosUsuario'].nomeUsuario;
			localStorage.emailUsuario = json['dadosUsuario'].emailUsuario;
			window.location.href = "main.html";
		}else{
			Materialize.toast(json.status, 5000);
		}
	})
	.fail(function() {
		console.log("fail");
	})
	.error(function(erro, a, e) {
		console.log("Encontramos um erro: " + erro.responseText + " - Status: " + erro.status + " - Elemento: " + e);
	})
	.always(function() {
		console.log("complete");
	});

}
