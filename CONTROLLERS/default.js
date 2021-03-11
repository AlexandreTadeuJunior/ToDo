//função para serializar o formulario
$.fn.serializeObject = function(){
	var myform = this;
	var disabled = myform.find(':input:disabled').removeAttr('disabled');

    var o = {};
    var a = this.serializeArray();

    $.each(a, function() {

        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });

	disabled.attr('disabled','disabled'); //desabilita os campos
    return o;
};

//funcao para montar a estrutura da pagina principal
function montaEstrutura(){

	 $( document ).ready(function() {
	    console.log("Estrutura: Inicializando estrutura da pagina");
	    $("#estrutura_topo").load("main_topo.html", function() {
	        console.log("Estrutura: topo montado");
	        //apos montar o topo monta o menu
	        $("#slide-out").load("main_menu.html",function(){
	            console.log("Estrutura: Menu montado");
              //apos montar aplica os scripts dos efeitos.
              $("#main_scripts").load("main_scripts.html",function(){
                  console.log("Estrutura: Scripts aplicados");
                  $("#materialPreloader").remove();
                  $(".loader-bg").remove();
                  $(".loader").remove();
                  $(".preloader-wrapper .big .active").remove();
                  $(".body:not(.loaded) .mn-content").css('opacity', '100');
									carragaConfUsuario();
              });
	        });
	    });
	});
}

//carrega a pagina para ser mostrada na view
function loadPage(pagina){

	console.clear();

  $("#main_conteudo").load(pagina);
  /*$("#main_conteudo").load(pagina,function(){
      aplicaEfeitos();
  });*/
  console.log('Tela montada: ' + pagina);
	localStorage.telaMontada= pagina;


}

//aplica efeitos em todas as tabelas daquela pagina
function aplicaEfeitos(){
      $('.responsive-table').DataTable({
            language: {
                searchPlaceholder: 'Buscar',
                sSearch: '',
                sLengthMenu: 'Show _MENU_',
                sLength: 'dataTables_length',
                oPaginate: {
                    sFirst: '<i class="material-icons">chevron_left</i>',
                    sPrevious: '<i class="material-icons">chevron_left</i>',
                    sNext: '<i class="material-icons">chevron_right</i>',
                    sLast: '<i class="material-icons">chevron_right</i>'
                }
            }
        });
        $('.dataTables_length select').addClass('browser-default');
}

//aplica efeito em uma tabela especifica
function aplicaEfeitosNome(tableTela){
      $(tableTela).DataTable({
            language: {
                searchPlaceholder: 'Buscar',
                sSearch: '',
                sLengthMenu: 'Show _MENU_',
                sLength: 'dataTables_length',
                oPaginate: {
                    sFirst: '<i class="material-icons">chevron_left</i>',
                    sPrevious: '<i class="material-icons">chevron_left</i>',
                    sNext: '<i class="material-icons">chevron_right</i>',
                    sLast: '<i class="material-icons">chevron_right</i>'
                }
            }
        });
        $('.dataTables_length select').addClass('browser-default');
}

//retira o efeito de todas as tabelas de uma pagina
function destroy_dataTable(){

    if ( $.fn.dataTable.isDataTable( '.responsive-table' ) ) {
        table = $('.responsive-table').DataTable();
        table.clear();
        table.destroy();
    }

}

//retira o efeito de uma tabela especifica de uma pagina
function destroy_dataTableNome(tableTela){

    if ( $.fn.dataTable.isDataTable( tableTela ) ) {
        table = $(tableTela).DataTable();
				table.clear();
        table.destroy();
    }

}

//coloca o nome do usuario e email no menu lateral esquerdo
function carragaConfUsuario(){
	$("#menu_user_name").each(function(index, el) {
		$(this).html(localStorage.nomeUsuario);
	});

	$("#menu_user_email").each(function(index, el) {
		$(this).html(localStorage.emailUsuario);
	});

	verificaPedidoDeAmizade();
}

//sair do sistema
function sairDoSistema(){
	localStorage.nomeUsuario = "";
	localStorage.emailUsuario = "";
	window.location.href = "login.html";
}

/***********************Notificacao usuario**********************************/
//funcao para verificar se tem pedido de amizade
var vPedidoDeAmizade = setInterval(
	function(){
		console.clear();
		verificaPedidoDeAmizade();
	}, 60000);

function verificaPedidoDeAmizade(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "listaPedidoDeAmizade", usuario: localStorage.nomeUsuario , email: localStorage.emailUsuario},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");

		if(json.code == 28){

			//limpo a lista de usuarios
			$("#ListaDeNotificacoesUsuario").empty();

			dadosListaAmigos = "<li class='notification-drop-title'>Notificação usuário</li>";
			count = 0;

			$.each(json.dadosPedidosAmizade, function(i, variavelJSON) {
				dadosListaAmigos = dadosListaAmigos + '<li>' +
																									'<div class="notification" onClick="modalCarregaPerfil(' + variavelJSON.idAmizade + ',\'' + variavelJSON.nomeCompleto + '\',\'' + variavelJSON.emailUsuario + '\',\'' + variavelJSON.imgProfile + '\')">' +
																											'<img src="' + variavelJSON.imgProfile + '" alt="" class="circle">' +
																											'<div class="notification-text"><p><b>Pedido de amizade</b></p><span>' + variavelJSON.nomeCompleto + '</span></div>' +
																									'</div>' +
																							'</li>';
				count += 1;
			});

			//adiciono o html na lista
			$("#ListaDeNotificacoesUsuario").append(dadosListaAmigos);
			$('#numeroDeNotificacaoUsuario').html(count);

		}else{
			//limpo a lista de usuarios
			$("#ListaDeNotificacoesUsuario").empty();
			$('#numeroDeNotificacaoUsuario').html(0);
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

function modalCarregaPerfil(idAmizade, nomeCompleto, emailUsuario, imgProfile){
	console.log("Montando modal");
	$("#modal_DadosUsuarioPedidoAmizade").openModal();
	$("#idAmizadePedidoAmizade").val(idAmizade);
	$("#nomeUsuarioModalPedidoAmizade").html(nomeCompleto);
	$("#emailUsuarioModalPedidoAmizade").html(emailUsuario);
	$("#imageModalPedidoAmizade").attr('src', imgProfile);
}

function adicionarAmizade(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "adicionaAmizade", idAmizade: $("#idAmizadePedidoAmizade").val()},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		swal("Amizade aceita!", json.status, "success");
		verificaPedidoDeAmizade();
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

function naoAceitarAmizade(){
	$.ajax({
		url: '../API/api.php',
		type: 'POST',
		dataType: 'json',
		cache: false,
        async: false, //false= ajax return do dnx, true = ajax layer do dnx
		data: {cmd: "deixarAmizade", idAmizade: $("#idAmizadePedidoAmizade").val()},
		crossDomain: true,
          xhrFields: {
            withCredentials: false
          }
	})
	.done(function(json) {
		console.log("success");
		swal("Amizade recusada!","", "success");
		verificaPedidoDeAmizade();
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
