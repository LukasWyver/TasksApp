import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  FlatList,
  Keyboard,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import Constants from "expo-constants";

import Login from "./src/components/Login";
import TaskList from "./src/components/TaskList";
import firebase from "./src/services/firebaseConnection";

export default function App() {
  const [user, setUser] = useState("");
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const inputRef = useRef(null);
  const [key, setKey] = useState("");

  useEffect(() => {
    function getUser() {
      if (!user) {
        return;
      }
      firebase
        .database()
        .ref("tarefas")
        .child(user)
        .once("value", (snapshot) => {
          setTasks([]);
          snapshot?.forEach((childItem) => {
            let data = {
              key: childItem.key,
              nome: childItem.val().nome,
            };
            setTasks((oldTasks) => [...oldTasks, data]);
          });
        });
    }

    getUser();
  }, [user]);

  function handleAdd() {
    if (newTask === "") {
      return;
    }

    //usuario quer editar uma tarefa.
    if (key !== "") {
      firebase
        .database()
        .ref("tarefas")
        .child(user)
        .child(key)
        .update({
          nome: newTask,
        })
        .then(() => {
          const taskIndex = tasks.findIndex((item) => item.key === key);
          let taskClone = tasks;
          taskClone[taskIndex].nome = newTask;
          setTasks([...taskClone]);
        });
      Keyboard.dismiss();
      setNewTask("");
      setKey("");
      return;
    }

    let tarefas = firebase.database().ref("tarefas").child(user);
    let chave = tarefas.push().key;
    tarefas
      .child(chave)
      .set({
        nome: newTask,
      })
      .then(() => {
        const data = {
          key: chave,
          nome: newTask,
        };
        setTasks((oldTasks) => [...oldTasks, data]);
      });

    Keyboard.dismiss();
    setNewTask("");
  }

  function handleDelete(key) {
    firebase
      .database()
      .ref("tarefas")
      .child(user)
      .child(key)
      .remove()
      .then(() => {
        const findTasks = tasks.filter((item) => item.key !== key);
        setTasks(findTasks);
      });
  }

  function handleEdit(data) {
    setKey(data.key);
    setNewTask(data.nome);
    inputRef.current.focus();
  }
  function cancelEdit() {
    setKey("");
    setNewTask("");
    Keyboard.dismiss();
  }

  if (!user) {
    return <Login changeStatus={(user) => setUser(user)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {key.length > 0 && (
        <View style={styles.taskEdit}>
          <TouchableOpacity onPress={cancelEdit}>
            <MaterialIcons name="cancel" size={24} color="#f8251a" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 5, color: "#f8251a" }}>
            Você esta editando uma tarefa! ...
          </Text>
        </View>
      )}

      <View style={styles.containerTask}>
        <TextInput
          placeholder="qual sua proxíma tarefa?"
          placeholderTextColor="#c8c8c8"
          returnKeyType="done"
          onChangeText={(value) => setNewTask(value)}
          value={newTask}
          style={styles.input}
          ref={inputRef}
        />
        <TouchableOpacity style={styles.buttonAdd} onPress={handleAdd}>
          <MaterialIcons name="add-task" size={28} color="#f5f5f5" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TaskList
            data={item}
            deleteItem={handleDelete}
            editItem={handleEdit}
          />
        )}
      />
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
  taskEdit: {
    marginLeft: 5,
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "center",
  },
  containerTask: {
    flexDirection: "row",
    paddingTop: "5%",
  },
  input: {
    flex: 1,
    height: 48,
    marginBottom: 10,
    borderRadius: 6,
    padding: 10,
    paddingLeft: 12,
    backgroundColor: "#FAFAFC",
    borderWidth: 1,
    borderColor: "#c8c8c8",
  },
  buttonAdd: {
    height: 48,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8941A",
    marginLeft: 10,
    paddingHorizontal: 10,
  },
});
