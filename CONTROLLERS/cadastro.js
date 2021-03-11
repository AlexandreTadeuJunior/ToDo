initializa_singUp();

function  initializa_singUp(){
	config_buttons();
}

function config_buttons(){
	$("#btn_singUp").click(function(event) {
			var erro = "";
			$(".validate").each(function(index, el) {
				if ( $(this).val()=="" ){
					erro = erro + " - " +  $(this).attr("description") + "<br>";
				}
			});
			if (erro ==""){
				singUp();
			} else {
				//alert (language_pack[1] + "\n" + erro);
				Materialize.toast(language_pack[1] + "<Br>" + erro, 4000);
			}
	});
}

function singUp(){
	//console.log("Formulario:" + JSON.stringify( $('#form-singUP').serializeObject() ) );
	//return;
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		data: {cmd: "cadastraUsuario", dados:  JSON.stringify( $('#form-singUP').serializeObject() )  },
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }

	})
	.done(function(json) {
		console.log("successo");
		if (json.code==8){
			Materialize.toast("Cadastro com sucesso", 5000);
			window.location.href = "login.html";
		} else {
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
