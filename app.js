import { html, Component } from './js/spux.js';
import { getPath, getQueryStringValue, loadFile, saveFile } from './util.js';

export class App extends Component {
  constructor() {
    super();
    const serverUrl = getQueryStringValue('storage') || 'https://nosdav.nostr.rocks';
    const mode = getQueryStringValue('mode') || 'm';
    const uri = getQueryStringValue('uri') || 'tasks.json';
    this.state = {
      userPublicKey: null,
      filename: uri,
      fileContent: '[]',
      tasks: [],
      taskInput: '',
      serverUrl: serverUrl,
      mode: mode,
    };
  }

  async componentDidMount() {
    await this.userLogin();
  }

  handleInputChange = (event) => {
    this.setState({ taskInput: event.target.value });
  }

  userLogin = async () => {
    const userPublicKey = await window.nostr.getPublicKey();
    console.log(`Logged in with public key: ${userPublicKey}`);
    await this.setState({ userPublicKey: userPublicKey });
    this.loadTasks();
  }

  loadTasks = async () => {
    const { userPublicKey, serverUrl, mode, filename } = this.state;
    const fileContent = await loadFile(serverUrl, userPublicKey, filename, mode);

    if (fileContent) {
      this.setState({ fileContent: fileContent, tasks: JSON.parse(fileContent) });
    }
  };

  saveTasks = async () => {
    const { tasks, userPublicKey, serverUrl, mode, filename } = this.state;
    const fileContent = JSON.stringify(tasks);
    const success = await saveFile(serverUrl, userPublicKey, filename, mode, fileContent);

    if (!success) {
      alert('Error saving tasks');
    }
  };

  addTask = () => {
    const { taskInput, tasks } = this.state;
    if (taskInput) {
      const updatedTasks = [...tasks, taskInput];
      this.setState({ tasks: updatedTasks, taskInput: '' }, this.saveTasks);
    }
  };

  deleteTask = (taskIndex) => {
    const updatedTasks = this.state.tasks.filter((_, index) => index !== taskIndex);
    this.setState({ tasks: updatedTasks }, this.saveTasks);
  };

  handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      this.addTask();
    }
  };

  render() {
    const { userPublicKey, taskInput, tasks } = this.state;

    return html`
      <div class="container">
        <h1>To-Do List</h1>
        <input
          type="text"
          id="taskInput"
          placeholder="Enter a new task"
          value=${taskInput}
          onChange=${this.handleInputChange}
          onKeyDown=${this.handleKeyDown}
        />
        <br/>
        <br/>

        ${userPublicKey
        ? html`
              <button onClick="${this.addTask}" type="button" style="background-color: #4CAF50; color: white; border: none; border-radius: 5px; padding: 5px 10px;">
                Add Task
              </button>
            `
        : html` <button style="background-color: #4CAF50; color: white; border: none; border-radius: 5px; padding: 5px 10px;" id="login" onClick="${this.userLogin}">
              Login
            </button>`}

        <ul id="taskList">
          ${tasks
        .slice(0)
        .reverse()
        .map(
          (task, index) => html`
                <li>
                  ${task}
                  <button onClick=${() => this.deleteTask(tasks.length - 1 - index)}>
                  🗑️
                </button>
              </li>
            `
        )}
      </ul>
    </div>
    `;
  }
}
