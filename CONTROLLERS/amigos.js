ini_nivelAcesso();

function ini_nivelAcesso(){
	console.clear();
	console.log("Iniciando tela de amigos");

	montaBotoes();
	montaListaAmigos();
}


function montaBotoes(){

	$('#btn_adicionarAmigo').click(function(event) {
		enviarSolicitacaoAmizadeSwal();
	});

	$("#btn_modalEnviarSolicitacao").click(function(event) {
		apiEnviarSolicitacao();
	});

	//Monta efeito para aparecer a msg a cima do botao
	$('.tooltipped').tooltip();
}

//aplica efeito na modal da tela
function montaModal_listaAtividade(){
	$('.modal-trigger').leanModal();
}

//chama API para montar os amigos na tela
function montaListaAmigos(){
	console.log("Chamando API");
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "listaAmigosUsuario", usuario: localStorage.nomeUsuario , email: localStorage.emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);

		if(json.code == 20){
			montaTemplateListaAmigos(json);
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

//monta a tabela dos amigos na tela
function montaTemplateListaAmigos(json){
	//limpo a lista de usuarios
	$("#listaAmigos").empty();

	dadosListaAmigos = "";

	$.each(json.amigos, function(i, variavelJSON) {
		dadosListaAmigos = dadosListaAmigos + '<li class="collection-item avatar">' +
													'<img src="' + variavelJSON.imgProfile + '" alt="" class="circle">' +
													'<span class="title">' + variavelJSON.nomeCompleto + '</span>' +
													'<p>' + variavelJSON.emailUsuario +	'</p>' +
													'<a href="#!" class="secondary-content" onClick="deixarAmizadeSwal(' + variavelJSON.idAmizade + ')" style="cursor:pointer;"><i class="material-icons">clear</i></a>' +
											'</li>'
	});

	//adiciono o html na lista
	$("#listaAmigos").append(dadosListaAmigos);
}

//Swal deletar amizade, confirma com o usuario se deseja deletar
function deixarAmizadeSwal(idAmizade){
	swal({
	    title: "Deixar amizade",
	    text: "Deseja deixar de ser amigo desse usuário",
	    type: "warning",
	    showCancelButton: true,
	    confirmButtonColor: "#DD6B55",
	    confirmButtonText: "Deixar!",
	    cancelButtonText: "Não, agora não",
	    closeOnConfirm: false,
	    closeOnCancel: false
	}, function(isConfirm){
	    if (isConfirm) {
					deixarAmizade(idAmizade);
	    } else {
	        swal("cancelamos a operação", ":)", "error");
	    }
	});
}

//deleta a amizade caso o usuario confirme a exclusão
function deixarAmizade(idAmizade){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "deixarAmizade", idAmizade: idAmizade},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
		if(json.code == 21){
			swal("Amizade cancelada", "", "success");
			montaListaAmigos();
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

//swal para pegar o email do usuario que iramos adicionar a amizade
function enviarSolicitacaoAmizadeSwal(){
		swal({
	  title: "Solicitação de Amizade!",
	  text: "Enviar solicitação de amizade para o e-mail:",
	  type: "input",
	  showCancelButton: true,
	  closeOnConfirm: true,
	  animation: "slide-from-top",
	  inputPlaceholder: "E-mail amigo"
	},
	function(inputValue){
	  if (inputValue === false) return false;

	  if (inputValue === "") {
	    swal.showInputError("Você precisa colocar um e-mail!");
	    return false
	  }

		abrirModalDadosUsuario(inputValue);

	});
}

function abrirModalDadosUsuario(emailUsuario){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "buscarEmailUsuario", email: emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		Materialize.toast(json.status, 5000);
		if(json.code == 23){
			$('#modal_novoUsuario').openModal();
			$("#idUsuarioNovoAmigo").val(json.dadosUsuario[0].idUsuario);
			$('#imageModalAdicionarAmigo').attr('src',json.dadosUsuario[0].imgProfile);
			$('#nomeUsuarioModalAdicionarAmigo').html(json.dadosUsuario[0].nomeCompleto);
			$('#emailUsuarioModalAdicionarAmigo').html(json.dadosUsuario[0].emailUsuario);

		}else{
			swal("Não encontramos este usuário", "", "error");
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

function apiEnviarSolicitacao(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "enviarSolicitacaoAmizade", idUsuarioAmigo: $("#idUsuarioNovoAmigo").val(), usuario: localStorage.nomeUsuario, email: localStorage.emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		if(json.code == 26){
			swal("Otimo!", "Sua solicitação foi enviada com sucesso", "success");
			return;
		}
		swal("OPS!", json.status, "error");
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
