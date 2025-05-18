import { createSignal, For, type Component } from "solid-js";

import styles from "./App.module.css";
import { createReconnectingWS } from "@solid-primitives/websocket";
import { makePersisted } from "@solid-primitives/storage";

const App: Component = () => {
	const [colors, setColors] = makePersisted(
		createSignal<{
			[id: string]: { color: string; name?: string };
		}>({}),
		{ name: "colors" },
	);

	const ws = createReconnectingWS("ws://localhost:3000");
	// const addMessage = (msg: WSMessage) => {
	// 	setMessages(messages.length, msg);
	// 	setTimeout(() => messageBox()?.lastElementChild?.scrollIntoView(), 50);
	// };
	ws.addEventListener("message", (msg) => {
		const message = String(msg.data);
		const [command, color, id] = message.split(" ");
		if (command === "color") {
			if (id) {
				setColors({ ...colors, [id]: { color: color } });
			}
		}
	});
	ws.send("server");

	return (
		<div class={styles.App}>
			<div class={styles.Grid}>
				<For each={Object.entries(colors())}>
					{([id, { name, color }], i) => {
						return (
							<div class={styles.Cell} style={{ "background-color": color }}>
								<div class={styles.Tag}>{name ?? id}</div>
							</div>
						);
					}}
				</For>
			</div>
			<div></div>
		</div>
	);
};

export default App;
