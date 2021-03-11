<?php

  iniUsuario();

  function iniUsuario(){
    $cmd = $_POST['cmd'];

    if(strtoupper($cmd) == strtoupper('loginUsuario')){
      loginUsuario($_POST['dados']);
    }elseif(strtoupper($cmd) == strtoupper('cadastraUsuario')){
      cadastraUsuario($_POST['dados']);
    }
  }

  /**
   * [loginUsuario API para login do usuario]
   * @param  [array] $dados [dados da tela como(nomeUsuario, senhaUsuario)]
   * @return [json] $retorno [json com os dados do usuario caso o login seja sucesso]
   */
  function loginUsuario($dados){
    //separo as variaveis que vem no array dados da VIEW
    $dcDados = json_decode($dados,true);

    $usuario = $dcDados['nomeUsuario'];
    $senha = $dcDados['senhaUsuario'];
    //print_r($dados);

    //crio o conector com o banco de dados
    $db = db_on();

    //executo a query
    $query = "select * from tb_usuario where nomeUsuario = '" . $usuario . "' and senhaUsuario = '" . $senha . "'";

    //echo $query;
    $retorno = sql_execute($db, $query);

    //verifico se encontrou algum registros
    if($retorno->num_rows != 0){
      //recebo o meu retorno
      $row = mysqli_fetch_array($retorno);
      //crio um array com os dados do usuario
      $dadosUsuario = array('nomeUsuario' => $row['nomeUsuario'], 'emailUsuario' => $row['emailUsuario']);
      $status = "login OK";
      $code = 1;
    }else{//se nao encontrou nenhum registro
      $dadosUsuario = array();
      $status = "não encontramos esse usuário ou senha não confere";
      $code = 2;
    }

    //desconecto do banco de dados
    db_off($db);

    //retorno json
    $array = array("code" => $code, "status" => $status, "dadosUsuario" => $dadosUsuario);
    echo json_encode($array);
    return;
  }

/**
 * [cadastraUsuario Cadastra o usuario no banco de dados]
 * @param  [array] $dados [dados da tela como (nomeUsuario, emailUsuario, senhaUsuario, confirmacaoSenha)]
 * @return [json] retorno       [code de 3 a 8]
 */
  function cadastraUsuario($dados){

    //separo as variaveis que vem no array dados da VIEW
    $dcDados = json_decode($dados, true);

    //confirmacao de dados da Tela
    if(empty($dcDados['nomeUsuario'])){//confirmo se mandou o nome de usuario
      $array = array("code" => 3, "status" => "Nome de usuário não é valido");
      echo json_encode($array);
      return;
    }

    if(empty($dcDados['emailUsuario'])){//confirmo se mandou o email do usuario
      $array = array("code" => 4, "status" => "e-mail de usuário não é valido");
      echo json_encode($array);
      return;
    }

    if(empty($dcDados['senhaUsuario']) || empty($dcDados['confirmacaoSenha'])){//confirmo se a senha e confirmação de senha é valida
      $array = array("code" => 5, "status" => "senha ou confirmação de senha não é valido");
      echo json_encode($array);
      return;
    }

    if($dcDados['senhaUsuario'] != $dcDados['confirmacaoSenha']){//verifico se a senha e confirmacao de senha sao iguais
      $array = array("code" => 6, "status" => "senha ou confirmação de senha não confere");
      echo json_encode($array);
      return;
    }

    //crio o conector com o banco de dados
    $db = db_on();

    //verifico se o usuario ja existe
    $query = "select * from tb_usuario where nomeUsuario = '" . $dcDados['nomeUsuario'] . "'";
    $retorno = sql_execute($db, $query);

    if($retorno->num_rows != 0){
      //envio a resposta para o front
      $array = array("code" => 7, "status" => "Nome de usuário já cadastrado em nosso banco de dados");
      echo json_encode($array);
      return;
    }

    //executo a query para salvar o usuario no banco de dados
    $query = "insert into tb_usuario (nomeUsuario, emailUsuario, senhaUsuario) values('" .
                                                                                        $dcDados['nomeUsuario'] . "','" .
                                                                                        $dcDados['emailUsuario'] . "','" .
                                                                                        $dcDados['senhaUsuario'] .
                                                                                      "')";
    $retorno = sql_execute($db, $query);

    //desligo o conector
    db_off($db);

    //envio a resposta para o front
    $array = array("code" => 8, "status" => "Dados cadastrados com sucesso");
    echo json_encode($array);
    return;

  }


?>
