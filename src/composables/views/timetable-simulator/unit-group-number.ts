import type { Ref } from "vue"
import { computed } from "vue"
import { useRoute, useRouter } from "vue-router"

export function useUnitGroupNumber(unitId: Ref<string>) {
    const router = useRouter()
    const route = useRoute()

    const queryKey = computed(() => {
        return `unitGroupNumber[${unitId.value}]`
    })

    return computed<number>({
        get: () => {
            const value = route.query[queryKey.value]

            if (Array.isArray(value)) {
                return Number(value[0])
            } else {
                return Number(value ?? 1)
            }
        },
        set: (value) => {
            router.replace({
                query: {
                    ...route.query,
                    [queryKey.value]: value,
                },
            })
        },
    })
}
