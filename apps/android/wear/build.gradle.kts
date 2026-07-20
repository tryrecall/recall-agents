import java.util.Properties

plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.ktlint)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.kotlin.serialization)
}

val steelEngineAndroidVersionFile = rootProject.file("Config/Version.properties")
val steelEngineAndroidVersionProperties =
  Properties().apply {
    if (!steelEngineAndroidVersionFile.isFile) {
      error("Missing Android version properties. Run `pnpm android:version:sync`.")
    }
    steelEngineAndroidVersionFile.inputStream().use(::load)
  }

fun requireSteelEngineAndroidVersionProperty(name: String): String =
  steelEngineAndroidVersionProperties.getProperty(name)?.trim()?.takeIf { it.isNotEmpty() }
    ?: error("Missing $name in Config/Version.properties. Run `pnpm android:version:sync`.")

val steelEngineAndroidPhoneVersionCode = requireSteelEngineAndroidVersionProperty("STEELENGINE_ANDROID_VERSION_CODE").toInt()
val steelEngineAndroidBuildNumber = steelEngineAndroidPhoneVersionCode % 100
check(steelEngineAndroidBuildNumber in 1..49) {
  "Android build number must be 01 through 49; Wear reserves 51 through 99."
}
val steelEngineAndroidWearVersionCode = steelEngineAndroidPhoneVersionCode + 50
check(steelEngineAndroidWearVersionCode <= 2_100_000_000) { "Wear versionCode exceeds the Android platform maximum." }

// Data Layer delivery requires the phone and watch packages to share one certificate.
evaluationDependsOn(":app")
val phoneReleaseSigning =
  project(":app")
    .extensions
    .getByType<com.android.build.api.dsl.ApplicationExtension>()
    .signingConfigs
    .findByName("release")

android {
  namespace = "ai.steelengine.wear"
  compileSdk = 37

  defaultConfig {
    // Data Layer traffic is scoped to matching package names and signatures.
    applicationId = "ai.steelengine.app"
    minSdk = 31
    targetSdk = 36
    versionCode = steelEngineAndroidWearVersionCode
    versionName = requireSteelEngineAndroidVersionProperty("STEELENGINE_ANDROID_VERSION_NAME")
  }

  buildTypes {
    release {
      if (phoneReleaseSigning != null) {
        signingConfig = phoneReleaseSigning
      }
      isMinifyEnabled = true
      isShrinkResources = true
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
    }
  }

  buildFeatures {
    compose = true
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  packaging {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
  }

  lint {
    lintConfig = rootProject.file("app/lint.xml")
    warningsAsErrors = true
  }
}

kotlin {
  compilerOptions {
    jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    allWarningsAsErrors.set(true)
  }
}

ktlint {
  android.set(true)
  ignoreFailures.set(false)
  filter {
    exclude("**/build/**")
  }
}

dependencies {
  val composeBom = platform(libs.androidx.compose.bom)
  implementation(composeBom)

  implementation(project(":wear-shared"))
  implementation(libs.androidx.activity.compose)
  implementation(libs.androidx.core.ktx)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.ktx)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.wear.compose.foundation)
  implementation(libs.androidx.wear.compose.material3)
  implementation(libs.androidx.wear.input)
  implementation(libs.androidx.wear.tiles)
  implementation(libs.androidx.wear.protolayout)
  implementation(libs.androidx.wear.protolayout.material)
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.serialization.json)
  implementation(libs.play.services.wearable)

  debugImplementation(libs.androidx.compose.ui.tooling)

  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.robolectric)
}
