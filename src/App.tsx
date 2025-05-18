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
	const [colorHistory, setColorHistory] = makePersisted(
		createSignal<string[]>([]),
		{ name: "colorHistory" },
	);

	const ws = createReconnectingWS("ws://localhost:3000");
	ws.addEventListener("message", (msg) => {
		const message = String(msg.data);
		const [command, color, id] = message.split(" ");
		if (command === "color") {
			setColorHistory([color, ...colorHistory()].slice(0, 100));
			if (id) {
				setColors({ ...colors(), [id]: { color: color } });
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
			<div class={styles.ColorHistory}>
				<For each={colorHistory()}>
					{(color, i) => {
						return (
							<div
								class={styles.ColorHistoryCell}
								style={{ "background-color": color }}
							/>
						);
					}}
				</For>
			</div>
		</div>
	);
};

export default App;
