ini_nivelAcesso();

function ini_nivelAcesso(){
	montaBotoes();
	montaModal_listaAtividade();
	listaAtividades();
}


function montaBotoes(){
	//botao para abrir a modal e cadastrar uma nova atividade
	$('#btn_cadAtividade').click(function(event) {
		$('#idAtividade').val(0);
		$('#nomeAtividade').val("");
		$('#descriAtividade').val("");
		$('#dtAtividade').val("dd/mm/aaaa");
		$('#hrAtividade').val("00:00");
	});

	//botao para salvar a atividade da modal
	$('#btn_modalSalvar').click(function(event) {
		salvaAtividade();
		listaAtividades();
	});

	//botao para deletar as atividades
	$('#btn_delAtividade').click(function(event) {
		deletarAtividadeSwal();
	});

	//Monta efeito para aparecer a msg a cima do botao
	$('.tooltipped').tooltip();
}

//aplica efeito na modal da tela
function montaModal_listaAtividade(){
	$('.modal-trigger').leanModal();
}

//lista atividades
function listaAtividades(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: true, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "listaAtividades", usuario: localStorage.nomeUsuario, email: localStorage.emailUsuario, historicoSN: 'N'},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
		if(json.code == 16){
				montaTabelaAtividadesFuturas(json);
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
function montaTabelaAtividadesFuturas(json){

	//limpa a tabela e seus dados
	destroy_dataTable();

	var cont = 0;
	$.each(json.atividades, function(i, variavelJSON) {
		$("#table_atividade tbody").append("<tr><td>" +
											"<input type='checkbox'" +
									 		" value='" + variavelJSON.idAtividade + "'" +
									 		" id='chkAtividade" + cont + "' name='idAtividade' />" +
									 		"<label for='chkAtividade" + cont + "'>"+ variavelJSON.nomeAtividade +"</label>" +
									 	"</td>" +
										"<td>" +
										 "<label>" + variavelJSON.descriAtividade + "</label>" +
										"</td>" +
										"<td>" +
										 "<label>" + variavelJSON.dtAtividade + "</label>" +
										"</td>" +
									 	"<td>" +
									 		"<a href='#modal_novaAtividade' onClick='buscaDadosAtividade(" + variavelJSON.idAtividade + ",\"" + variavelJSON.nomeAtividade + "\",\"" + variavelJSON.descriAtividade + "\",\"" + variavelJSON.dt + "\",\"" + variavelJSON.hr + "\");' class='modal-trigger'><i class='material-icons' style='cursor:pointer;'>edit</i></a>" +
									 	"</td>" +
									 	"</tr>");
		cont = cont + 1;
	});

	//aplica o efeito na tabela
	aplicaEfeitos();

	//aplica efeito na modal
	montaModal_listaAtividade();

}

//monta os dados na modal
function buscaDadosAtividade(idAtividade, nomeAtividade, descriAtividade, dt, hr){
	$('#idAtividade').val(idAtividade);
	$('#nomeAtividade').val(nomeAtividade);
	$('#descriAtividade').val(descriAtividade);
	$('#dtAtividade').val(dt);
	$('#hrAtividade').val(hr);
}

//salva a atividade
function salvaAtividade(){
  $.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "salvarAtividade",dados: JSON.stringify( $('#form-novaAtividade').serializeObject()), usuario: localStorage.nomeUsuario, email: localStorage.emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
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

//Swal deletar atividade, confirma com o usuario se deseja deletar
function deletarAtividadeSwal(){
	swal({
	    title: "Deletar",
	    text: "Deseja deletar essas atividades",
	    type: "warning",
	    showCancelButton: true,
	    confirmButtonColor: "#DD6B55",
	    confirmButtonText: "Deletar!",
	    cancelButtonText: "Não, agora não",
	    closeOnConfirm: false,
	    closeOnCancel: false
	}, function(isConfirm){
	    if (isConfirm) {
					deletarAtividade();
	    } else {
	        swal("cancelamos a operação", ":)", "error");
	    }
	});
}

//deleta a atividade caso o usuario confirme a exclusão
function deletarAtividade(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "deletaAtividade", dados:JSON.stringify( $('#form-table_atividade').serializeObject())},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
		if(json.code == 17){
			swal("Dados excluidos", "", "success");
			listaAtividades();//monto a lista
		}else{
			swal("Erro ao excluir", "", "error");
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
