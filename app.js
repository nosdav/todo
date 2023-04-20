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
    // await this.userLogin();
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
      const newTask = {
        '@id': Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
        created_at: Math.floor(Date.now() / 1000),
        content: taskInput,
      };
      const updatedTasks = [...tasks, newTask];
      this.setState({ tasks: updatedTasks, taskInput: '' }, this.saveTasks);
    }
  };

  formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const dateTimeFormat = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return dateTimeFormat.format(date);
  };


  deleteTask = (taskId) => {
    const updatedTasks = this.state.tasks.filter((task) => task['@id'] !== taskId);
    this.setState({ tasks: updatedTasks }, this.saveTasks);
  };

  handleKeyUp = (event) => {
    console.log(event.key)
    if (event.key === 'Enter') {
      console.log('enter pressed')
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
          onKeyUp=${this.handleKeyUp}
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
          (task) => html`
                <li>
                  ${task.content}
                  <span class="timestamp">
                    ${this.formatTimestamp(task.created_at)}
                  </span>
                  <button onClick=${() => this.deleteTask(task['@id'])}>
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
