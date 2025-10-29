<script lang="ts">
	const {
		size = 24,
		color = 'currentcolor',
		strokeWidth = 2
	}: { size?: number | string; color?: string; strokeWidth?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	version="1.1"
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
	stroke={color}
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	fill="none"
	class="lucide"
>
	<path
		d="m7.5489 7.0311-5.5557 8.1253c1.6226 1.0026 3.4578 1.8124 5.1591 1.8124 2.9574 0 4.0983-0.93425 6.1173-1.5684zm10.277 1.9021-4.3839 6.4152c1.0072-0.29984 2.2395-0.5204 4.0088-0.5204 1.5629 0 3.1288 0.0922 4.5561 0.22252z"
	/>
</svg>
