import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Constants from "expo-constants";

import firebase from "../../services/firebaseConnection";

console.disableYellowBox = true;

export default function Login({ changeStatus }) {
  const [type, setType] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef();

  function handleLogin() {
    if (type === "login") {
      //aqui fazemos o login.
      const user = firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid);
        })
        .catch((error) => {
          console.log(error);
          alert("Ops parece que deu algum erro.");
          return;
        });
    } else {
      //aqui cadastramos o usuario.
      const user = firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((user) => {
          changeStatus(user.user.uid);
        })
        .catch((error) => {
          console.log(error);
          alert("Ops parece que algo esta errado!.");
          return;
        });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        placeholder="e-mail"
        placeholderTextColor="#c8c8c8"
        keyboardType="email-address"
        returnKeyType="next"
        // onSubmitEditing={() => passwordRef.current.focus()}
        onChangeText={(value) => setEmail(value)}
        value={email}
        style={styles.textInput}
      />
      <TextInput
        inputRef={passwordRef}
        placeholder="******"
        placeholderTextColor="#c8c8c8"
        secureTextEntry
        returnKeyType="done"
        onChangeText={(value) => setPassword(value)}
        value={password}
        style={styles.textInput}
      />
      <TouchableOpacity
        style={[
          styles.handleLogin,
          {
            backgroundColor: type === "login" ? "#132435" : "#F8941A",
          },
        ]}
        onPress={handleLogin}
      >
        <Text style={styles.loginText}>
          {type === "login" ? "Acessar" : "Cadastrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          setType((type) => (type === "login" ? "cadastrar" : "login"))
        }
      >
        <Text style={{ textAlign: "center" }}>
          {type === "login" ? "Criar uma conta" : "Já possuo uma conta"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    paddingHorizontal: 10,
    backgroundColor: "#f5f5f5",
  },
  textInput: {
    height: 48,
    marginBottom: 10,
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#FAFAFC",
    borderWidth: 1,
    borderColor: "#c8c8c8",
  },
  handleLogin: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginBottom: 10,
    borderRadius: 6,
  },
  loginText: {
    color: "#fff",
    fontSize: 18,
  },
});
