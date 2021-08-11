import { Injectable } from "@nestjs/common"
import { isEmpty } from "lodash"
import request from "request"

import { Address } from "../shipping.types"

// TODO: Update this to neatly encapsulate errors as well
interface UPSValidateResult {
  // Valid if UPS returns "ValidAddressIndicator"
  // Ambiguous if UPS returns "AmbiguousAddressIndicator"
  // Nonsense if UPS returns "NoCandidatesIndicator"
  validationClassification: "Valid" | "Ambiguous" | "Nonsense"

  // If we are A) able to and b) need to surface an alternative
  // address to the client, this is populated. Otherwise null
  alternative?: Address
}

@Injectable()
export class UPSService {
  constructor() {}

  async validateAddress(address: Address): Promise<UPSValidateResult> {
    const validationResult = await this.makeValidationRequest(address)
    const response = validationResult.XAVResponse
    const result: UPSValidateResult = {
      validationClassification:
        response.ValidAddressIndicator === ""
          ? "Valid"
          : response.AmbiguousAddressIndicator === ""
          ? "Ambiguous"
          : response.NoCandidatesIndicator === ""
          ? "Nonsense"
          : null,
    }
    if (result.validationClassification === null) {
      throw new Error(`Invalid payload: ${JSON.stringify(validationResult)}`)
    }

    const candidate = response.Candidate.AddressKeyFormat // gauranteed to exist by this point

    let candidateStreet1, candidateStreet2
    if (typeof candidate.AddressLine === "string") {
      candidateStreet1 = candidate.AddressLine
    } else {
      ;[candidateStreet1, candidateStreet2] = candidate.AddressLine
    }
    const candidateCity = candidate.PoliticalDivision2
    const candidateState = candidate.PoliticalDivision1
    const candidateZip = candidate.PostcodePrimaryLow

    if (
      candidateStreet1 === address.street1.toUpperCase() &&
      candidateCity === address.city.toUpperCase() &&
      candidateState === address.state.toUpperCase() &&
      candidateZip === address.zip.toUpperCase()
    ) {
      return result
    }

    result.alternative = {
      street1: candidateStreet1,
      street2: candidateStreet2,
      city: candidateCity,
      state: candidateState,
      zip: candidateZip,
    }

    return result
  }

  private async makeValidationRequest(address: Address): Promise<any> {
    const AddressLine = [address.street1]
    if (!!address.street2) {
      AddressLine.push(address.street2)
    }

    return new Promise((resolve, reject) => {
      request(
        {
          uri: `https://wwwcie.ups.com/addressvalidation/v1/1?regionalrequestindicator=false&maximumcandidatelistsize=1`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Username: "seasons_nyc",
            Password: "CkvFVrmxZ8kyLRtQBP3n",
            AccessLicenseNumber: "4DA25ECC53553416",
          },
          body: {
            XAVRequest: {
              AddressKeyFormat: {
                AddressLine,
                Region: `${address.city},${address.state},${address.zip}`,
                PoliticalDivision2: address.city,
                PostcodePrimaryLow: address.zip,
                PoliticalDivision1: address.state,
                CountryCode: "US",
              },
            },
          },
          json: true,
        },
        (error, _response, body) => {
          if (error) {
            reject(error)
            return
          }

          resolve(body)
          return
        }
      )
    })
  }
}
