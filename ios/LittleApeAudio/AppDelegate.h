#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <Expo/Expo.h>
// This is a new line
#import "RNAppAuthAuthorizationFlowManager.h"

// This is the changed line
@interface AppDelegate : EXAppDelegateWrapper <RNAppAuthAuthorizationFlowManager>

@property(nonatomic, weak)id<RNAppAuthAuthorizationFlowManagerDelegate>authorizationFlowManagerDelegate;

@end