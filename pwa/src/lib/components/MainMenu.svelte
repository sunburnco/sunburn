<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
</script>

{#snippet header(text: string)}
	<DropdownMenu.GroupHeading>
		<div class="font-display fl-text-xs/sm font-bold opacity-70 select-none">
			{text}
		</div>
	</DropdownMenu.GroupHeading>
{/snippet}

<div class="flex items-center justify-center">
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="fl-size-[4.5/6] overflow-hidden rounded-field select-none hover:brightness-80 data-[state=open]:translate-y-px data-[state=open]:brightness-80"
		>
			<img src="/sunburn.svg" alt="Sunburn Logo" />
		</DropdownMenu.Trigger>

		<DropdownMenu.Portal>
			<DropdownMenu.Content class="rounded-box bg-base-100 fl-p-1/2 text-base-content shadow-md">
				<DropdownMenu.Group>
					{@render header('Accounts')}

					<a href="/login">
						<DropdownMenu.Item
							class="rounded-box flp-md hover:bg-base-content hover:text-base-100 hover:brightness-80"
						>
							Login
						</DropdownMenu.Item>
					</a>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
</div>
