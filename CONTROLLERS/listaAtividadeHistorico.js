ini_nivelAcesso();

function ini_nivelAcesso(){
	listaAtividadesHistorico();
}


//lista atividades
function listaAtividadesHistorico(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: true, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "listaAtividades", usuario: localStorage.nomeUsuario, email: localStorage.emailUsuario, historicoSN: 'S'},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
		if(json.code == 16){
				montaTabelaAtividadesHistorico(json);
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

//monta tabela na tela
function montaTabelaAtividadesHistorico(json){

	//limpa a tabela e seus dados
	destroy_dataTable();

	var cont = 0;
	$.each(json.atividades, function(i, variavelJSON) {
		$("#table_atividade_historico tbody").append("<tr><td>" +
									 		"<label>"+ variavelJSON.nomeAtividade +"</label>" +
									 	"</td>" +
										"<td>" +
										 "<label>" + variavelJSON.descriAtividade + "</label>" +
										"</td>" +
										"<td>" +
										 "<label>" + variavelJSON.dtAtividade + "</label>" +
										"</td>" +
									 	"</tr>");
		cont = cont + 1;
	});

	//aplica o efeito na tabela
	aplicaEfeitos();

	//aplica efeito na modal
	montaModal_listaAtividade();

}
