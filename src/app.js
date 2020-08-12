App = {
	contracts: {},
	contractAddress: null,

	load: async () => {
		// app loading..
		console.log("App loading..")
		await App.loadWeb3()
		await App.loadAccount()
		await App.loadContracts()
		await App.render()
	},

	loadWeb3: async () => {
		App.web3 = new Web3(window["ethereum"] || Web3.currentProvider || "http://localhost:7545")
	},

	// load account
	loadAccount: async () => {
		App.accounts = await App.web3.eth.getAccounts()
		await App.web3.eth.getBalance(App.accounts[0], (err, wei) => {
			App.balance = App.web3.utils.fromWei(wei, "ether")
		})
		App.networkId = await App.web3.eth.net.getId()
	},

	// load contracts
	loadContracts: async () => {
		await $.getJSON("TodoList.json", function (todoList) {
			if (App.networkId) {
				const networkData = todoList.networks[App.networkId]
				App.contractAddress = networkData.address
				App.contracts.TodoList = new App.web3.eth.Contract(todoList.abi, App.contractAddress)
			}
			return App.contracts.TodoList
		})
		App.TodoInstance = await App.contracts.TodoList
	},

	// As UI
	render: async () => {
		// Prevent double render
		if (App.loading) {
			return
		}

		// Update app loading state
		App.setLoading(true)
		// Render Account
		$("#account").html(App.accounts[0])
		// Render Tasks
		await App.renderTasks()

		// Update loading state
		App.setLoading(false)
	},

	renderTasks: async () => {
		const taskCount = await App.TodoInstance.methods.taskCount().call()
		const $taskTemplate = $(".taskTemplate")
		// Render out each task with a new task template
		for (var i = 1; i <= taskCount; i++) {
			// Fetch the task data from the blockchain
			const task = await App.TodoInstance.methods.tasks(i).call()
			console.log(task)
			const taskId = task[0]
			const taskContent = task[1]
			const taskCompleted = task[2]

			// Create the html for the task
			const $newTaskTemplate = $taskTemplate.clone()
			$newTaskTemplate.find(".content").html(taskContent)
			$newTaskTemplate.find("input").prop("name", taskId).prop("checked", taskCompleted)
			// .on('click', App.toggleCompleted)

			// Put the task in the correct list
			if (taskCompleted) {
				$("#completedTaskList").append($newTaskTemplate)
			} else {
				$("#taskList").append($newTaskTemplate)
			}

			// Show the task
			$newTaskTemplate.show()

			$newTaskTemplate
				.find("input")
				.prop("name", taskId)
				.prop("checked", taskCompleted)
				.on("click", App.toggleCompleted)
		}
  },
  
  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.TodoInstance.methods.toggleCompleted(taskId).send({ from: App.accounts[0]})
    window.location.reload()
  },

	setLoading: (boolean) => {
		App.loading = boolean
		const loader = $("#loader")
		const content = $("#content")
		if (boolean) {
			loader.show()
			content.hide()
		} else {
			loader.hide()
			content.show()
		}
	},

	createTask: async () => {
		App.setLoading(true)
		const content = $("#newTask").val()
		console.log(await App.TodoInstance.methods.createNewTask(content).send({ from: App.accounts[0] }))
		window.location.reload()
	},
}

const init = () => {
	window.onload = App.load()
}

init()
