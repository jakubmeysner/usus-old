interface ParticipantCount {
    count: number
    limit: number
}

async function fetchParticipantCount(
    unitId: number,
    groupNumber: number,
): Promise<ParticipantCount> {
    const response = await fetch(
        `https://web.usos.pwr.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazZajecia&gr_nr=${groupNumber}&zaj_cyk_id=${unitId}`,
    )

    if (response.status !== 200) {
        throw new Error(`Received ${response.status} response status code`)
    }

    const text = await response.text()
    const match = text.match(
        /Liczba osób w grupie:\D+(\d+)\D+Limit miejsc:\D+(\d+)/s,
    )

    if (match === null) {
        throw new Error(
            `Could not find a match for participant count in document`,
        )
    }

    return {
        count: parseInt(match[1]),
        limit: parseInt(match[2]),
    }
}

async function getParticipantCount(
    unitId: number,
    groupNumber: number,
): Promise<ParticipantCount> {
    let lastError = null

    for (let i = 0; i < 3; i++) {
        try {
            return fetchParticipantCount(unitId, groupNumber)
        } catch (error) {
            lastError = error
        }
    }

    throw lastError
}

interface Env {}

export const onRequest: PagesFunction<Env> = async (context) => {
    const request: Request = context.request
    const url = new URL(request.url)

    const unitId = Number(url.searchParams.get("unitId"))
    const groupNumber = Number(url.searchParams.get("groupNumber"))

    const participantCount = await getParticipantCount(unitId, groupNumber)

    return Response.json(participantCount)
}
