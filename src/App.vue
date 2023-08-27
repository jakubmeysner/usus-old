<script lang="ts" setup>
import AppBar from "@/components/app/AppBar.vue"
import NavigationDrawer from "@/components/app/NavigationDrawer.vue"
</script>

<template>
    <v-app>
        <app-bar />
        <navigation-drawer />
        <router-view />
    </v-app>
</template>
