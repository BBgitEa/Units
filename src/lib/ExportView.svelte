<script lang="ts">
	import type { RenderableDiagram } from '../types';

	const { svgElement, diagramData } = $props<{
		svgElement: SVGSVGElement | undefined;
		diagramData: RenderableDiagram | undefined;
	}>();

	let isExporting = $state(false);


	/**
	 * Генерирует и скачивает файл на основе Blob
	 */
	function downloadBlob(blob: Blob, filename: string) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Создает "чистую" копию SVG для экспорта.
	 */
	function getCleanSvgContent(): string | null {
		if (!svgElement) return null;

		const clone = svgElement.cloneNode(true) as SVGSVGElement;
		clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		clone.removeAttribute('onpointerdown');
		clone.removeAttribute('onpointermove');
		clone.removeAttribute('onpointerup');
		clone.removeAttribute('onwheel');
        
		return clone.outerHTML;
	}

	/**
	 * Экспортирует диаграмму в формат SVG
	 */
	async function exportToSvg() {
		if (!diagramData) return;
		isExporting = true;

		const svgContent = getCleanSvgContent();
		if (!svgContent) {
			isExporting = false;
			return;
		}

		const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
		const filename = `${diagramData.title || 'diagram'}.svg`;
		downloadBlob(blob, filename);
		isExporting = false;
	}

	/**
	 * Экспортирует диаграмму в формат PNG
	 */
	async function exportToPng() {
		if (!diagramData) return;
		isExporting = true;

		const svgContent = getCleanSvgContent();
		if (!svgContent) {
			alert('Не удалось подготовить SVG для экспорта.');
			isExporting = false;
			return;
		}

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			alert('Не удалось получить контекст для рендеринга PNG.');
			isExporting = false;
			return;
		}

		canvas.width = diagramData.width;
		canvas.height = diagramData.height;

		const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

		const img = new Image();
		img.onload = () => {
			ctx.drawImage(img, 0, 0);

			canvas.toBlob((pngBlob) => {
				if (pngBlob) {
					const filename = `${diagramData.title || 'diagram'}.png`;
					downloadBlob(pngBlob, filename);
				}
				isExporting = false;
			}, 'image/png');
		};

		img.onerror = () => {
			alert('Ошибка при загрузке SVG для конвертации в PNG. Проверьте консоль на наличие ошибок.');
			console.error('Failed to load SVG into image:', svgContent);
			isExporting = false;
		};

		img.src = url;
	}
</script>

<div class="export-container">
	<h2>Экспорт диаграммы</h2>
	<div class="export-content">
		<p>Выберите формат для сохранения текущей диаграммы в виде файла.</p>
		<div class="button-group">
			<button onclick={exportToSvg} disabled={isExporting || !svgElement}>
				{isExporting ? 'Экспорт...' : 'Экспорт в SVG'}
			</button>
			<button onclick={exportToPng} disabled={isExporting || !svgElement}>
				{isExporting ? 'Экспорт...' : 'Экспорт в PNG'}
			</button>
		</div>
	</div>
</div>

<style>
	.export-container {
		padding: 2rem;
		background-color: var(--background-color);
		color: var(--text-color);
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		box-sizing: border-box;
	}
	.export-content{
		border: 1px solid var(--background-secondary-color);
		padding: 1rem;
		border-radius: 8px;
	}
	.button-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;

	}
	button {
		padding: 6px 12px;
		border-radius: 6px;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.1s ease;
		border: 1px solid var(--primary-color);
		background-color: var(--primary-color);
		color: white;
	}
	button:hover:not(:disabled) {
		background-color: #6ba9dd;
	}
	button:active:not(:disabled) {
		transform: scale(0.98);
	}
	button:disabled {
		background-color: var(--background-secondary-color);
		border-color: var(--secondary-color);
		color: var(--secondary-color);
		cursor: not-allowed;
	}
</style>