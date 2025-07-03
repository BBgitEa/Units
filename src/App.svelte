<script lang="ts">
  import { IDEFDiagramBuilder } from './IDEFDiagramBuilder';
  import { IDEFParser } from './IDEFParser';

  import type { RenderableDiagram, ConfigMetadata, IDEF0Diagram } from './types';
  import type { TreeNodeData } from './lib/tree/treeTypes';
  import type { BuilderConfig } from './IDEFDiagramBuilder';

  import DiagramView from './lib/DiagramView.svelte';
  import SettingsView from './lib/SettingsView.svelte';
  import Editor from './lib/Editor.svelte';
  import Splitter from './lib/Splitter.svelte';
  import Tabs from './lib/tabs/Tabs.svelte';
  import Tab from './lib/tabs/Tab.svelte';
  import Tree from './lib/tree/Tree.svelte';

  import { Braces, Info, ArrowRightFromLine, Settings2 } from 'lucide-svelte';
  import ExportView from './lib/ExportView.svelte';
  import InfoView from './lib/InfoView.svelte';

  let diagramCode = $state(`# IDEF-Script для описания диаграммы IDEF0
# Комментарии начинаются с символа #

diagram "Процесс обработки заказа в интернет-магазине" {
    node: "A0"
    author: "Аналитик С. Петров"
    version: "1.2"
}

activities {
    activity(A1, "Принять и зарегистрировать заказ")
    activity(A2, "Проверить наличие и зарезервировать товар")
    activity(A3, "Скомплектовать и отгрузить заказ")
}

flows {
    # --- Входы (Inputs) и Управление (Controls) ---
    external -> input(A1): "Запрос от клиента"
    external -> input(A1): "Данные о товарах"
    external -> control(A2): "Данные складских остатков"

    # --- Связи между блоками ---
    output(A1) -> input(A2): "Зарегистрированный заказ"
    output(A2) -> control(A3): "Подтверждение резерва товара"
    output(A2) -> input(A3): "Подтверждение резерва товара"

    # --- Механизмы ---
    external -> mechanism(A1, A2, A3): "Информационная система предприятия"

    # --- Выходы (Outputs) ---
    output(A3) -> external: "Уведомление клиенту об отправке"
}
  `);

  let parsedDiagram: IDEF0Diagram | undefined = $state();
  let renderableDiagram: RenderableDiagram | undefined = $state();
  let errorMessages = $state<string[]>([]);

  let config: BuilderConfig = $state({
    diagramWidth: 1600,
    diagramHeight: 900,
    minBlockWidth: 180,
    minBlockHeight: 120,
    arrowSpacing: 25,
    labelHeight: 100,
    labelWidth: 200,
  });

  	const configMetadata: ConfigMetadata = {
		diagramWidth: {
			label: 'Ширина диаграммы',
			type: 'number',
			min: 800,
			max: 4000,
			step: 1
		},
		diagramHeight: {
			label: 'Высота диаграммы',
			type: 'number',
			min: 600,
			max: 3000,
			step: 1
		},
		minBlockWidth: {
			label: 'Мин. ширина блока',
			type: 'number',
			min: 100,
			max: 500,
			step: 1
		},
    minBlockHeight: {
			label: 'Мин. высота блока',
			type: 'number',
			min: 80,
			max: 500,
			step: 1
		},
		arrowSpacing: {
			label: 'Отступ стрелок',
			type: 'number',
			min: 10,
			max: 50
		},
    labelWidth: {
      label: 'Ширина метки',
      type: 'number',
      min: 100,
      max: 500,
    },
    labelHeight: {
      label: 'Высота метки',
      type: 'number',
      min: 50,
      max: 300,
    },
	};

  let diagramSvgElement: SVGSVGElement | undefined;

  $effect(() => {
    const parser = new IDEFParser();
    errorMessages = []; // Очищаем ошибки перед новой попыткой

    try {
      const parsedDiagram = parser.parse(diagramCode);
      const builder = new IDEFDiagramBuilder(parsedDiagram, config);
      renderableDiagram = builder.build();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        errorMessages = [error.message];
      } else {
        console.error("An unknown error occurred", error);
        errorMessages = ["An unknown error occurred"];
      }
      // Если произошла ошибка, не показываем старую диаграмму
      renderableDiagram = undefined;
    }
  });

</script>

<main>
    <Splitter initial={0.4} minA={400} minB={400}>
      <Tabs  slot="a">
        <Tab title="Редактор" icon={Braces}>
          <Editor language="idefscript" bind:value={diagramCode} />
        </Tab>
        <Tab title="Настройки" icon={Settings2}>
          <SettingsView {config} metadata={configMetadata} />
        </Tab>
        <Tab title="Экспорт" icon={ArrowRightFromLine}>
          <ExportView
            svgElement={diagramSvgElement}
            diagramData={renderableDiagram}
          />
        </Tab>
        <Tab title="Справка" icon={Info}>
          <InfoView />
        </Tab>
      </Tabs>
      <div slot="b" class="diagram-pane">
        {#if renderableDiagram}
          <DiagramView data={renderableDiagram} bind:svgElement={diagramSvgElement} />
        {:else}
          <div class="placeholder">
            {#if errorMessages.length > 0}
              <div class="error-display">
                <h2>Ошибка построения диаграммы:</h2>
                {#each errorMessages as msg}
                  <p>{msg}</p>
                {/each}
              </div>
            {:else}
              <p>Загрузка диаграммы...</p>
            {/if}
          </div>
        {/if}
      </div>
    </Splitter>
</main>

<style>
  main {
    height: 100vh;
    width: 100vw;
  }
  .diagram-pane, .editor-pane {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    background-color: #f8f8f8;
    color: #888;
    font-family: sans-serif;
  }
  .error-display {
    padding: 20px;
    background-color: #fff0f0;
    border: 1px solid #d8000c;
    color: #d8000c;
    border-radius: 8px;
    max-width: 80%;
  }
</style>