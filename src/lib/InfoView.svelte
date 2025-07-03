<script lang="ts">
	import Accordion from './accordions/Accordion.svelte';
	import AccordionItem from './accordions/AccordionItem.svelte';
</script>

<style>
	.info-container {
		--primary-color: #569cd6;
		--secondary-color: #838383;
		--background-color: #242424;
		--background-secondary-color: #404040;
		--text-color: #cccccc;
		--code-bg: #1e1e1e;

		padding: 2rem;
		background-color: var(--background-color);
		color: var(--text-color);
		height: 100%;
		overflow-y: auto;
	}

	.content-wrapper p,
	.content-wrapper li {
		line-height: 1.6;
		font-size: 0.95rem;
		color: var(--text-color);
	}

	.content-wrapper strong {
		color: var(--primary-color);
		font-weight: 500;
	}

	.content-wrapper code {
		background-color: var(--code-bg);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: 'Courier New', Courier, monospace;
		color: #ce9178;
	}

	.content-wrapper pre {
		background-color: var(--code-bg);
		padding: 1rem;
		border-radius: 6px;
		white-space: pre-wrap;
		word-break: break-all;
	}

	.content-wrapper ul {
		padding-left: 20px;
	}

	.footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid var(--background-secondary-color);
		text-align: center;
		color: var(--secondary-color);
		font-size: 0.9rem;
	}
</style>

<div class="info-container">
	<h2>Справка</h2>
	<div class="content-wrapper">
		<Accordion>
			<AccordionItem title="Синтаксис IDEF-Script">
				<p>IDEF-Script — это простой язык для описания диаграмм IDEF0.</p>
				<p>
					<strong>Комментарии:</strong> строки, начинающиеся с <code>#</code>, игнорируются.
				</p>

				<p><strong>1. Блок <code>diagram</code></strong></p>
				<p>
					Этот блок задает глобальные свойства диаграммы, такие как ее название, контекстный номер
					и автора.
				</p>
				<pre>
<code>diagram "Название диаграммы" {'{'}
    node: "A-0"
    author: "Имя автора"
    version: "1.0"
 {'}'}</code></pre>

				<p><strong>2. Блок <code>activities</code></strong></p>
				<p>
					Здесь перечисляются все процессы (прямоугольники) на диаграмме. Каждый процесс имеет
					уникальный <code>ID</code> (например, A1, A2) и текстовое описание.
				</p>
				<pre>
<code>activities {'{'}
    activity(A1, "Принять и зарегистрировать заказ")
    activity(A2, "Проверить наличие товара")
{'}'}</code></pre>

				<p><strong>3. Блок <code>flows</code></strong></p>
				<p>
					Самый важный блок, описывающий стрелки (потоки). Он определяет, как активности
					связаны друг с другом и с внешней средой.
				</p>
				<ul>
					<li>
						Ключевое слово <code>external</code> используется для обозначения источника или
						получателя стрелки, находящегося <strong>за пределами</strong> текущей диаграммы.
					</li>
					<li>
						Можно указать <strong>несколько блоков-получателей</strong> для одной стрелки,
						просто перечислив их ID через запятую.
					</li>
				</ul>
				<pre>
<code>flows {'{'}
    # ВХОД: Стрелка поступает извне в блок А1
    external -> input(A1): "Запрос от клиента"

    # УПРАВЛЕНИЕ: Стрелка поступает извне и управляет блоком А2
    external -> control(A2): "Правила обработки заказов"

    # МЕХАНИЗМ: Один механизм используется несколькими блоками
    external -> mechanism(A1, A2, A3): "Информационная система"

    # ВНУТРЕННЯЯ СВЯЗЬ: Выход из А1 становится входом для А2
    output(A1) -> input(A2): "Зарегистрированный заказ"

    # ВЫХОД: Результат работы блока А3 уходит во внешнюю среду
    output(A3) -> external: "Уведомление клиенту"
{'}'}</code></pre>
			</AccordionItem>

			<AccordionItem title="Управление в окне диаграммы">
				<ul>
					<li>
						<strong>Панорамирование (перемещение):</strong> Зажмите
						<strong>правую кнопку мыши</strong> и двигайте курсор.
					</li>
					<li>
						<strong>Масштабирование:</strong> Используйте
						<strong>колесико мыши</strong> для приближения и отдаления.
					</li>
				</ul>
			</AccordionItem>

			<AccordionItem title="Навигация по приложению">
				<ul>
					<li>
						<strong>Редактор:</strong> Здесь вы пишете код вашей диаграммы на языке IDEF-Script.
						Диаграмма обновляется автоматически при изменении кода. Используется редактор кода 
						<strong>Monaco Editor</strong>, лежащий в основе Visual Studio Code.
					</li>
					<li>
						<strong>Настройки:</strong> Позволяет изменить визуальные параметры диаграммы, такие
						как размеры холста, блоков и отступы стрелок.
					</li>
					<li>
						<strong>Экспорт:</strong> Сохранение текущей диаграммы в форматах <strong>SVG</strong>
						(векторный) и <strong>PNG</strong> (растровый).
					</li>
					<li>
						<strong>Справка:</strong> Эта вкладка, которую вы сейчас читаете.
					</li>
				</ul>
			</AccordionItem>
		</Accordion>

		<div class="footer">
			<p>Автор: bonefishd</p>
			<p>Версия: v0.0.5</p>
		</div>
	</div>
</div>