import { Handler } from "@netlify/functions"

export const handler: Handler = async (event) => {
    const unitId = event.queryStringParameters.unitId
    const groupNumber = event.queryStringParameters.groupNumber

    const response = await fetch(
        `https://web.usos.pwr.edu.pl/kontroler.php?_action=katalog2/przedmioty/pokazZajecia&gr_nr=${groupNumber}&zaj_cyk_id=${unitId}`,
    )

    if (response.status === 200) {
        const text = await response.text()
        const match = text.match(/Liczba osób w grupie:\D+(\d+)\D+Limit miejsc:\D+(\d+)/s)

        if (match === null) {
            return {
                statusCode: 500,
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                count: parseInt(match[1]),
                limit: parseInt(match[2]),
            }),
        }
    } else {
        return {
            statusCode: 500,
        }
    }
}
