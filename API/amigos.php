<?php
ini_amigos();

function ini_amigos(){
  $cmd = $_POST['cmd'];

  if(strtoupper($cmd) == strtoupper("listaAmigosUsuario")){
    listaAmigosUsuario($_POST['usuario'], $_POST['email']);
  }elseif(strtoupper($cmd) == strtoupper("deixarAmizade")){
    deixarAmizade($_POST['idAmizade']);
  }elseif(strtoupper($cmd) == strtoupper("buscarEmailUsuario")){
    buscarEmailUsuario($_POST['email']);
  }elseif(strtoupper($cmd) == strtoupper("enviarSolicitacaoAmizade")){
    enviarSolicitacaoAmizade($_POST['idUsuarioAmigo'], $_POST['usuario'], $_POST['email']);
  }elseif(strtoupper($cmd) == strtoupper("listaPedidoDeAmizade")){
    listaPedidoDeAmizade($_POST['usuario'], $_POST['email']);
  }elseif(strtoupper($cmd) == strtoupper("adicionaAmizade")){
    adicionaAmizade($_POST['idAmizade']);
  }
}

/**
 * [listaAmigosUsuario listar amigos para o usuario logado]
 * @param  [string] $usuario [usuario logado]
 * @param  [string] $email   [email usuario]
 * @return [json]          [description]
 */
function listaAmigosUsuario($usuario, $email){
  //pego o id da atividade
  $idUsuario = getIdUsuario($usuario, $email);

  if($idUsuario == 0){
    //envio a resposta para o front
    $array = array("code" => 12, "status" => "Desculpe, mas perdemos sua conexão, favor logar novamente no sistema. Obrigado");
    echo json_encode($array);
    return;
  }

  //conecto no banco de dados
  $db = db_on();

  //crio a query para consultar no banco de dados
  $query = "select A.*, B.nomeCompleto, B.emailUsuario from tb_amigos A " .
              	"inner join tb_usuario B on A.id_amigoUsuario = B.idUsuario " .
              	"where tb_usuario_idUsuario = " . $idUsuario . " and aceitoSN='S';";

  $retorno = sql_execute($db,$query);

  db_off($db);

  if($retorno->num_rows == 0){
    //envio a resposta para o front
    $array = array("code" => 19, "status" => "Não encontramos amigos para esse usuário");
    echo json_encode($array);
    return;
  }

  //criando um array para armazenar os dados dos amigos
  $dadosAmigos = array();

  //vou em cada linha da minha resposta sql e salvo no array de amigos
  while ($row = mysqli_fetch_array($retorno)) {
    $row['imgProfile'] = "../assets/images/profile-image-2.png";
    array_push($dadosAmigos, $row);
  }

  //envio a resposta para o front
  $array = array("code" => 20, "status" => "Lista de amigos", "amigos" => $dadosAmigos);
  echo json_encode($array);
  return;
}

/**
 * [deixarAmizade desfazendo amizade]
 * @param  [int] $idAmizade [idAmizade]
 * @return [json]            [description]
 */
function deixarAmizade($idAmizade){
  //conecto no banco de dados
  $db = db_on();

  //crio a query para deletar no banco de dados
  $query = "delete from tb_amigos where idAmizade='" . $idAmizade . "';";

  $retorno = sql_execute($db,$query);

  db_off($db);

  $jsn = json_encode(array("code" => 21, "status" => "Amizade cancelada"));
  echo $jsn;
  return $jsn;
}

/**
 * [buscarEmailUsuario busca dados do usuario com aquele email]
 * @param  [string] $email [email do usuario]
 * @return [json]        [description]
 */
function buscarEmailUsuario($email){
  //conecto no banco de dados
  $db = db_on();

  //crio a query para n=buscar o usuario no bd
  $query = "select idUsuario, emailUsuario, nomeCompleto from tb_usuario where emailUsuario='" . $email . "'";

  $retorno = sql_execute($db,$query);

  db_off($db);

  if($retorno->num_rows == 0){
    //envio a resposta para o front
    $array = array("code" => 22, "status" => "Não encontramos esse usuário");
    echo json_encode($array);
    return;
  }

  //criando um array para armazenar os dados dos amigos
  $dadosUsuario = array();

  //vou em cada linha da minha resposta sql e salvo no array de amigos
  while ($row = mysqli_fetch_array($retorno)) {
    $row['imgProfile'] = "../assets/images/profile-image-2.png";
    array_push($dadosUsuario, $row);
  }

  $jsn = json_encode(array("code" => 23, "status" => "Usuario encontrado", "dadosUsuario" => $dadosUsuario));
  echo $jsn;
  return $jsn;
}

/**
 * [enviarSolicitacaoAmizade envia a solicitação de amizade para ser aceita pelo usuario]
 * @param  [int] $idUsuarioAmigo [id usuario a enviar a solicitação]
 * @param  [string] $usuario        [usuario que esta enviando a solicitação]
 * @param  [string] $email          [email do usuario que esta enviando a solicitação]
 * @return [json]                 [description]
 */
function enviarSolicitacaoAmizade($idUsuarioAmigo, $usuario, $email){
  //pego o id da atividade
  $idUsuario = getIdUsuario($usuario, $email);

  if($idUsuario == 0){
    //envio a resposta para o front
    $array = array("code" => 12, "status" => "Desculpe, mas perdemos sua conexão, favor logar novamente no sistema. Obrigado");
    echo json_encode($array);
    return;
  }

  if($idUsuario == $idUsuarioAmigo){
    //envio a resposta para o front
    $array = array("code" => 24, "status" => "não podemos adicionar você como seu amigo");
    echo json_encode($array);
    return;
  }

  //conecto no banco de dados
  $db = db_on();

  //verifico se o usuario ja esta adicionado como amigo
  $query = "select * from tb_amigos where tb_usuario_idUsuario = " . $idUsuario . " and id_amigoUsuario = " . $idUsuarioAmigo . ";";
  $retorno = sql_execute($db,$query);

  if($retorno->num_rows != 0){
    //envio a resposta para o front
    $array = array("code" => 25, "status" => "usuário já cadastrado como amigo, ou ainda não aceitou sua solicitação de amizade");
    echo json_encode($array);
    return;
  }

  //crio a query para consultar no banco de dados
  $query = "insert into tb_amigos (id_amigoUsuario, tb_usuario_idUsuario, aceitoSN) VALUES ('" . $idUsuarioAmigo . "', '" . $idUsuario . "', 'N');";
  $retorno = sql_execute($db,$query);

  db_off($db);

  //envio a resposta para o front
  $array = array("code" => 26, "status" => "Solicitação enviada");
  echo json_encode($array);
  return;

}

/**
 * [listaPedidoDeAmizade lista o pedido de amizade para aquele perfil logado]
 * @param  [string] $usuario [nome usuario logado]
 * @param  [string] $email   [email usuario logado]
 * @return [json]          [description]
 */
function listaPedidoDeAmizade($usuario, $email){
  //pego o id da atividade
  $idUsuario = getIdUsuario($usuario, $email);

  if($idUsuario == 0){
    //envio a resposta para o front
    $array = array("code" => 12, "status" => "Desculpe, mas perdemos sua conexão, favor logar novamente no sistema. Obrigado");
    echo json_encode($array);
    return;
  }

  //conecto no banco de dados
  $db = db_on();

  //verifico se o usuario tem pedidos de amizade
  $query = "select A.idAmizade, B.nomeUsuario, B.emailUsuario, B.nomeCompleto, B.idUsuario from tb_amigos A " .
            	"inner join tb_usuario B on A.tb_usuario_idUsuario = B.idUsuario " .
              "where A.id_amigoUsuario = " . $idUsuario . " and aceitoSN = 'N';";

  $retorno = sql_execute($db,$query);

  db_off($db);

  //array auxiliar
  $dadosPedidosAmizade = array();

  if($retorno->num_rows== 0){
    $jsn = json_encode(array("code" => 27));
    echo $jsn;
    return $jsn;
  }

  while($row = mysqli_fetch_array($retorno)){
    $row['imgProfile'] = "../assets/images/profile-image-2.png";
    $dadosPedidosAmizade[] = $row;
  }

  $jsn = json_encode(array("code" => 28 , "dadosPedidosAmizade" => $dadosPedidosAmizade));
  echo $jsn;
  return $jsn;

}

function adicionaAmizade($idAmizade){
  //conecto no banco de dados
  $db = db_on();

  //seleciono a amizade
  $query = "select * from tb_amigos where idAmizade = " . $idAmizade;
  $retorno = sql_execute($db,$query);

  db_off($db);

  $row = mysqli_fetch_array($retorno);

  $db = db_on();

  //adiciono a amizade no bd
  $query = "insert into tb_amigos (id_amigoUsuario, tb_usuario_idUsuario, aceitoSN) VALUES (" . $row['tb_usuario_idUsuario'] . ", " . $row['id_amigoUsuario'] . ", 'S');";

  $retorno = sql_execute($db,$query);

  //troco o aceitaSN por S
  $query = "update tb_amigos set aceitoSN='S' WHERE idAmizade='" . $idAmizade . "'";

  $retorno = sql_execute($db,$query);

  db_off($db);

  //envio a resposta para o front
  $array = array("code" => 29, "status" => "Amigo adicionado com sucesso");
  echo json_encode($array);
  return;

}

 ?>
