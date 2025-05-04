import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary p-4 md:p-8 flex justify-center items-center">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
             <CardTitle className="text-2xl font-semibold text-foreground">Terms and Conditions</CardTitle>
             <Button variant="ghost" size="icon" asChild>
               <Link href="/auth/register"> {/* Link back to registration or appropriate page */}
                 <ArrowLeft className="h-5 w-5" />
                 <span className="sr-only">Back</span>
               </Link>
             </Button>
          </div>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base max-w-none text-muted-foreground">
          <p><strong>Last Updated: [Date]</strong></p>

          <p>Welcome to Zyren! These terms and conditions outline the rules and regulations for the use of Zyren&apos;s Mobile Application.</p>

          <p>By accessing this app we assume you accept these terms and conditions. Do not continue to use Zyren if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h3 className="text-foreground">License</h3>
          <p>Unless otherwise stated, Zyren and/or its licensors own the intellectual property rights for all material on Zyren. All intellectual property rights are reserved. You may access this from Zyren for your own personal use subjected to restrictions set in these terms and conditions.</p>

          <p>You must not:</p>
          <ul>
              <li>Republish material from Zyren</li>
              <li>Sell, rent or sub-license material from Zyren</li>
              <li>Reproduce, duplicate or copy material from Zyren</li>
              <li>Redistribute content from Zyren</li>
          </ul>

          <h3 className="text-foreground">User Data and Privacy</h3>
          <p>Our Privacy Policy, which is available separately, describes how we collect, use, and protect your personal data, including biometric data, location data, and data from wearable devices. Your use of Zyren constitutes acceptance of our Privacy Policy.</p>
           <p>You grant Zyren the right to use the data collected (including but not limited to GPS, wearable data, and contextual information) to personalize insurance recommendations, adjust premiums (if applicable), and improve our services. All data usage will comply with our Privacy Policy.</p>


          <h3 className="text-foreground">Facial Recognition</h3>
           <p>If you opt to use facial recognition for login, you consent to the collection and storage of your biometric facial data solely for the purpose of authentication within the Zyren app. This data will be stored securely and handled according to our Privacy Policy.</p>

           <h3 className="text-foreground">Insurance Policies</h3>
           <p>Zyren provides a platform to manage and potentially activate insurance policies. The specific terms, conditions, coverage details, and exclusions of each insurance policy are governed by the respective insurance provider and the policy documents you agree to. Zyren is not the insurer. </p>
           <p>Automatic activation features are provided for convenience but rely on data inputs. Zyren is not liable for activations or non-activations resulting from inaccurate data, technical failures, or unforeseen circumstances. It is your responsibility to review policy details and ensure appropriate coverage.</p>


          <h3 className="text-foreground">Disclaimer</h3>
          <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our app and the use of this app. Nothing in this disclaimer will:</p>
          <ul>
              <li>limit or exclude our or your liability for death or personal injury;</li>
              <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
              <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
              <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
          </ul>
          <p>The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>

          <p>As long as the app and the information and services on the app are provided free of charge (or based on the agreed premium structure), we will not be liable for any loss or damage of any nature.</p>

           <p><strong>Placeholder:</strong> More specific legal clauses regarding insurance simulation, AI recommendations, data usage for premiums, wearable device policies, payment terms, etc., would be required here in a real application.</p>

          {/* Add more sections as required */}

        </CardContent>
      </Card>
    </div>
  );
}
