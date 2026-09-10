<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
import SelectableRoleCard from '../components/SelectableRoleCard.vue'

function handleRoleSelect(role) {
  router.push({ name: role })
}
</script>

<template>
  <main
    class="flex flex-col items-center justify-center pt-2 bg-[url('/images/JDRImage.png')] bg-cover bg-center min-h-screen"
  >
    <div class="bg-black/20 backdrop-blur-sm rounded-4xl px-12 py-8 mb-16">
      <h1
        class="text-6xl font-black mb-2 justify-center font-['Cinzel'] text-amber-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]"
      >
        Welcome to the JDR Game !
      </h1>
      <p
        class="text-lg font-bold text-center text-amber-500 font-['Cinzel'] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
      >
        Please select your role to begin the adventure...
      </p>
    </div>

    <div class="flex w-full px-12 items-center gap-12 justify-center">
      <SelectableRoleCard
        title="MJ"
        description="This is the description for Role 2."
        role="mj"
        image="/images/MjImage.png"
        @select="handleRoleSelect"
      >
      </SelectableRoleCard>
      <SelectableRoleCard
        title="Player"
        description="This is the description for Role 1."
        role="player"
        image="/images/PlayerImage.png"
        @select="handleRoleSelect"
      >
      </SelectableRoleCard>
    </div>
  </main>
</template>
